
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { ChatMessage, GroundingChunk } from '../types';
import { Role } from '../types';
import { UserIcon, CopyIcon, CheckIcon, SearchIcon, CodeIcon, ExternalLinkIcon, SpeakerOnIcon, SpeakerOffIcon } from './IconComponents';
import { BrandLogo } from './BrandLogo';

// --- Inlined Hook for Text-to-Speech ---
const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const synth = window.speechSynthesis;

  const speak = useCallback((text: string) => {
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const arabicVoice = voices.find(voice => voice.lang.startsWith('ar-'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    synth.speak(utterance);
  }, [synth]);

  const cancel = useCallback(() => {
    synth.cancel();
    setIsSpeaking(false);
  }, [synth]);

  useEffect(() => {
    const handleVoicesChanged = () => synth.getVoices();
    synth.addEventListener('voiceschanged', handleVoicesChanged);
    return () => {
      synth.removeEventListener('voiceschanged', handleVoicesChanged);
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, [synth]);

  return { isSpeaking, speak, cancel };
};

// --- Sub-Components ---

const HamzawyCodeBlock: React.FC<{ htmlContent: string }> = ({ htmlContent }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const openInNewTab = () => {
    try {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error("Error creating blob for preview:", error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error('Failed to copy text: ', err));
  };

  return (
    <div className="mt-2 border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      <div className="bg-gray-800 px-3 py-1.5 flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-400 flex items-center gap-2">
            <CodeIcon className="w-4 h-4" />
            كود حمزاوي
        </span>
        <div className="flex items-center gap-1">
           <button onClick={handleCopy} className="text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors flex items-center gap-1.5">
             {copied ? <><CheckIcon className="w-3 h-3 text-green-400"/> تم النسخ</> : <><CopyIcon className="w-3 h-3"/> نسخ</>}
           </button>
           <button onClick={openInNewTab} className="text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors flex items-center gap-1.5">
             <ExternalLinkIcon className="w-3 h-3" />
             فتح في تبويب جديد
           </button>
           <div className="w-px h-4 bg-gray-600 mx-1"></div>
           <button 
                onClick={() => setShowPreview(p => !p)}
                className="text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors"
           >
                {showPreview ? 'إظهار الكود' : 'عرض المعاينة'}
           </button>
        </div>
      </div>
      {showPreview ? (
         <iframe
            srcDoc={htmlContent}
            title="Code Preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-96 bg-white"
            loading="lazy"
        />
      ) : (
        <div className="max-h-96 overflow-auto">
          <pre className="whitespace-pre-wrap text-sm font-mono text-gray-300 p-3">
            <code>{htmlContent}</code>
          </pre>
        </div>
      )}
    </div>
  );
};


const GroundingAttribution: React.FC<{ metadata: GroundingChunk[] }> = ({ metadata }) => {
  if (!metadata || metadata.length === 0) return null;
  
  return (
    <div className="mt-3 pt-3 border-t border-gray-700/50">
      <h4 className="text-xs font-bold text-gray-400 flex items-center gap-2 mb-2">
        <SearchIcon className="w-4 h-4"/>
        <span>المصادر من بحث Google</span>
      </h4>
      <div className="flex flex-wrap gap-2">
        {metadata.map((chunk, index) => (
          <a
            key={index}
            href={chunk.web.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-gray-700/80 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded-md transition-colors truncate"
            title={chunk.web.title}
          >
            {index + 1}. {chunk.web.title || new URL(chunk.web.uri).hostname}
          </a>
        ))}
      </div>
    </div>
  );
};


// --- Main Component ---

const extractHtmlContent = (text: string): string | null => {
    const match = text.match(/```html\n([\s\S]*?)```/);
    return match ? match[1] : null;
};

export const ChatMessageComponent: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const { isSpeaking, speak, cancel } = useTextToSpeech();
  const isUserModel = message.role === Role.MODEL;
  
  const textContent = message.parts.map(part => part.text || '').join('\n');
  const htmlContent = useMemo(() => (isUserModel && message.persona === 'HAMZAWY_CODE') ? extractHtmlContent(textContent) : null, [textContent, isUserModel, message.persona]);

  const handleCopy = (contentToCopy: string) => {
    navigator.clipboard.writeText(contentToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const handleSpeak = (contentToSpeak: string) => {
    if (isSpeaking) {
      cancel();
    } else {
      speak(contentToSpeak);
    }
  };

  const userBubbleClasses = 'bg-[var(--user-message-bg)] text-white';
  const modelBubbleClasses = 'bg-gray-800/50 backdrop-blur-md border border-gray-700/50 text-gray-200';
  const bubbleRadiusVar = isUserModel ? '--bubble-radius-model' : '--bubble-radius-user';

  return (
    <div className={`flex items-end gap-3 my-4 group ${!isUserModel ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center self-start mt-1 ${isUserModel ? 'bg-gray-700' : 'bg-[var(--user-message-bg)]'}`}>
        {isUserModel ? <BrandLogo className="w-5 h-5" /> : <UserIcon className="w-5 h-5 text-white" />}
      </div>
      <div 
        className={`relative max-w-2xl w-fit px-4 py-3 shadow-md ${isUserModel ? modelBubbleClasses : userBubbleClasses}`}
        style={{ borderRadius: `var(${bubbleRadiusVar})` }}
      >
        
        {htmlContent ? (
          <HamzawyCodeBlock htmlContent={htmlContent} />
        ) : (
          <>
            {message.parts.map((part, index) => (
                <div key={index}>
                    {part.image && (
                        <img 
                          src={`data:image/jpeg;base64,${part.image}`} 
                          alt="User upload" 
                          className="rounded-lg max-w-xs object-contain mb-2"
                        />
                    )}
                    {part.video && (
                        <video
                            src={`data:${part.videoMimeType};base64,${part.video}`}
                            controls
                            className="rounded-lg max-w-sm w-full object-contain mb-2"
                            />
                    )}
                    {part.text && (
                       <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: part.text }} />
                    )}
                </div>
            ))}

            {isUserModel && textContent && (
                 <div className="absolute top-0 -left-14 flex flex-col gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                        onClick={() => handleCopy(textContent)}
                        className="p-1.5 rounded-full bg-gray-700/80 text-gray-400 hover:bg-gray-600 hover:text-white"
                        aria-label={copied ? "تم النسخ" : "نسخ النص"}
                    >
                        {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={() => handleSpeak(textContent)}
                        className="p-1.5 rounded-full bg-gray-700/80 text-gray-400 hover:bg-gray-600 hover:text-white"
                        aria-label={isSpeaking ? "إيقاف الصوت" : "تشغيل الصوت"}
                    >
                        {isSpeaking ? <SpeakerOffIcon className="w-4 h-4 text-red-400" /> : <SpeakerOnIcon className="w-4 h-4" />}
                    </button>
                 </div>
            )}
            
            <GroundingAttribution metadata={message.groundingMetadata ?? []} />
          </>
        )}
      </div>
    </div>
  );
};
