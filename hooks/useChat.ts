
import { useState, useRef, useCallback, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { ai, createChatSession, generateImage, generateVideo, getVideosOperation } from '../services/geminiService';
import type { AppMode } from '../App';
import type { ChatMessage, LoadingState, ImageFile, MessagePart, Persona, ChatSession, GroundingChunk } from '../types';
import { Role } from '../types';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const useChat = (
  activeSession: ChatSession | null, 
  onUpdateSession: (updater: (prev: ChatSession) => ChatSession) => void,
  appMode: AppMode
) => {
  const [loadingState, setLoadingState] = useState<LoadingState>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (activeSession) {
      const history = activeSession.messages.map(m => ({
        role: m.role,
        parts: m.parts.map(p => ({ text: p.text || '' }))
      }));
      chatRef.current = createChatSession(activeSession.persona, history);
    } else {
      chatRef.current = null;
    }
  }, [activeSession]);
  
  const addMessagePair = (userMessageParts: MessagePart[]) => {
    if (!activeSession) return { userMessage: null, modelMessageId: null };

    const currentPersona = activeSession.persona;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      parts: userMessageParts,
      persona: currentPersona,
    };
    
    const modelMessageId = (Date.now() + 1).toString();
    const modelMessage: ChatMessage = {
      id: modelMessageId,
      role: Role.MODEL,
      parts: [{ text: '' }],
      persona: currentPersona,
    };

    onUpdateSession(prev => ({ ...prev, messages: [...prev.messages, userMessage, modelMessage] }));

    return { userMessage, modelMessageId };
  };

  const handleChatMessage = async (prompt: string, image: ImageFile | undefined, useSearch: boolean, userMessage: ChatMessage, modelMessageId: string) => {
    const messagePartsForApi: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [{ text: prompt }];

    if (image) {
      messagePartsForApi.unshift({
        inlineData: { mimeType: image.mimeType, data: image.data }
      });
    }

    setLoadingState('STREAMING');
    let accumulatedText = '';
    let finalGroundingMetadata: GroundingChunk[] = [];
    
    if (useSearch) {
      setLoadingState('LOADING');
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: { parts: messagePartsForApi },
          config: { tools: [{googleSearch: {}}] },
      });
      accumulatedText = response.text;
      finalGroundingMetadata = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

    } else {
      if (!chatRef.current) throw new Error("Chat session not initialized");
      // FIX: The sendMessageStream method expects an object with a 'message' property containing the parts array, as per the SendMessageParameters type.
      const stream = await chatRef.current.sendMessageStream({ message: messagePartsForApi });
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          accumulatedText += chunkText;
          onUpdateSession(prev => ({
            ...prev,
            messages: prev.messages.map(m => m.id === modelMessageId ? { ...m, parts: [{ text: accumulatedText }] } : m)
          }));
        }
      }
    }
    onUpdateSession(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === modelMessageId ? { ...m, parts: [{ text: accumulatedText }], groundingMetadata: finalGroundingMetadata } : m)
    }));
  };

  const handleImageGeneration = async (prompt: string, modelMessageId: string) => {
    const images = await generateImage(prompt);
    onUpdateSession(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === modelMessageId ? { ...m, parts: images.map(img => ({ image: img })) } : m)
    }));
  };
  
  const handleVideoGeneration = async (prompt: string, image: ImageFile | undefined, modelMessageId: string) => {
    let operation = await generateVideo(prompt, image);

    const poll = async () => {
      try {
        operation = await getVideosOperation(operation);
        if (operation.done) {
          // FIX: Property 'error' does not exist on type 'GenerateVideosResponse'. The error object is a property of the operation itself. Check for `operation.error` before accessing `operation.response`.
          if (operation.error) {
            // FIX: Ensure the argument to `new Error` is always a string to prevent type errors.
            throw new Error(String(operation.error.message ?? 'Video generation failed with an unknown error.'));
          }

          const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
          if (downloadLink && process.env.API_KEY) {
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            const videoBlob = await videoResponse.blob();
            const videoBase64 = await blobToBase64(videoBlob);
            
            onUpdateSession(prev => ({
              ...prev,
              messages: prev.messages.map(m => m.id === modelMessageId ? { ...m, parts: [{ video: videoBase64, videoMimeType: videoBlob.type }] } : m)
            }));
            setLoadingState('IDLE'); // End loading here
          } else {
            throw new Error("Video generation finished but no URI was found.");
          }
        } else {
          setTimeout(poll, 10000);
        }
      } catch(e) {
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during video polling.';
          console.error(e);
          setError(errorMessage);
          setLoadingState('IDLE');
          onUpdateSession(prev => ({
            ...prev,
            messages: prev.messages.map(m => m.id === modelMessageId ? { ...m, parts: [{ text: `Error: ${errorMessage}` }] } : m)
          }));
      }
    };
    setTimeout(poll, 5000); // Start polling after 5s
  };


  const sendMessage = useCallback(async (prompt: string, image: ImageFile | undefined, useSearch: boolean) => {
    if (loadingState !== 'IDLE' || !activeSession) return;

    setError(null);
    setLoadingState('LOADING');

    const userMessageParts: MessagePart[] = [{ text: prompt }];
    if (image) {
      userMessageParts.unshift({ image: image.data });
    }
    
    const { userMessage, modelMessageId } = addMessagePair(userMessageParts);
    if (!userMessage || !modelMessageId) return;

    try {
      switch (appMode) {
        case 'IMAGE_GEN':
          await handleImageGeneration(prompt, modelMessageId);
          break;
        case 'VIDEO_GEN':
          await handleVideoGeneration(prompt, image, modelMessageId);
          // Don't set loading to IDLE here, polling will do it.
          return; 
        case 'CHAT':
        default:
          await handleChatMessage(prompt, image, useSearch, userMessage, modelMessageId);
          break;
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error(e);
      setError(errorMessage);
       onUpdateSession(prev => ({
         ...prev,
         messages: prev.messages.filter(msg => msg.id !== userMessage.id && msg.id !== modelMessageId)
       }));
    } finally {
       if (appMode !== 'VIDEO_GEN') {
          setLoadingState('IDLE');
       }
    }
  }, [loadingState, activeSession, onUpdateSession, appMode]);

  return { loadingState, error, sendMessage };
};
