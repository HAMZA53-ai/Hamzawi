import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { ChatMessage, GroundingChunk, LoadingState, Persona } from '../types';
import { Role } from '../types';
import { UserIcon, CopyIcon, CheckIcon, SearchIcon, CodeIcon, ExternalLinkIcon, SpeakerOnIcon, SpeakerOffIcon, SparklesIcon } from './IconComponents';
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

const CodeBlock: React.FC<{ language: string, code: string }> = ({ language, code }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => console.error('Failed to copy code: ', err));
    }, [code]);

    return (
        <div className="mt-2 border border-gray-700 rounded-lg overflow-hidden bg-gray-900 text-start" dir="ltr">
            <div className="bg-gray-800 px-3 py-1.5 flex justify-between items-center text-xs text-gray-400">
                <span>{language || 'code'}</span>
                <button onClick={handleCopy} className="px-2 py-1 rounded hover:bg-gray-700 transition-colors flex items-center gap-1.5 text-gray-300">
                    {copied ? <><CheckIcon className="w-4 h-4 text-green-400"/> Copied</> : <><CopyIcon className="w-4 h-4"/> Copy</>}
                </button>
            </div>
            <div className="max-h-96 overflow-auto p-3">
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-300">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
};


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

const PersonaBadge: React.FC<{ persona: Persona }> = ({ persona }) => {
    const badgeMap: Partial<Record<Persona, { text: string; icon: React.ReactNode; className: string }>> = {
        'GPT': { text: 'رد رسمي', icon: <CheckIcon className="w-3 h-3"/>, className: 'bg-emerald-900/80 text-emerald-300'},
        'CLAUDE': { text: 'مفيد وآمن', icon: <CheckIcon className="w-3 h-3"/>, className: 'bg-orange-900/80 text-orange-300'},
        'TEACHER': { text: 'نقطة تعليمية', icon: <SparklesIcon className="w-3 h-3"/>, className: 'bg-yellow-900/80 text-yellow-300'},
    };
    const badge = badgeMap[persona];
    if (!badge) return null;

    return (
        <div className={`absolute -top-3 right-3 text-xs flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md ${badge.className}`}>
            {badge.icon}
            <span>{badge.text}</span>
        </div>
    );
};


// --- Main Component ---

const extractHtmlContent = (text: string): string | null => {
    const match = text.match(/```html\n([\s\S]*?)```/);
    return match ? match[1] : null;
};

export const ChatMessageComponent: React.FC<{ message: ChatMessage; isLastMessage: boolean; loadingState: LoadingState; }> = ({ message, isLastMessage, loadingState }) => {
  const [copied, setCopied] = useState(false);
  const { isSpeaking, speak, cancel } = useTextToSpeech();
  const isUserModel = message.role === Role.MODEL;
  
  const textContent = message.parts.map(part => part.text || '').join('');
  const isStreaming = isLastMessage && isUserModel && loadingState === 'STREAMING';

  const htmlContent = useMemo(() => (isUserModel && message.persona === 'HAMZAWY_CODE') ? extractHtmlContent(textContent) : null, [textContent, isUserModel, message.persona]);

  const contentParts = useMemo(() => {
    const parts: { type: 'text' | 'code'; content: string; language?: string }[] = [];
    if (!textContent) return parts;

    let lastIndex = 0;
    const regex = /```(\w*)\n([\s\S]*?)\n```/g;
    let match;

    while ((match = regex.exec(textContent)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: textContent.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'code', language: match[1], content: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < textContent.length) {
      parts.push({ type: 'text', content: textContent.substring(lastIndex) });
    }
    
    if (parts.length === 0 && textContent) {
        parts.push({ type: 'text', content: textContent });
    }

    return parts;
  }, [textContent]);


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

  const renderMessageContent = () => {
    if (htmlContent) {
        return <HamzawyCodeBlock htmlContent={htmlContent} />;
    }

    return (
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
                </div>
            ))}
            {contentParts.map((part, index) => {
                if (part.type === 'code') {
                    return <CodeBlock key={index} language={part.language ?? ''} code={part.content} />;
                }
                const isLastTextPart = index === contentParts.length - 1 && part.type === 'text';
                return (
                    <div
                        key={index}
                        className="whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: part.content + (isStreaming && isLastTextPart ? '<span class="blinking-cursor"></span>' : '') }}
                    />
                );
            })}
        </>
    );
  };


  return (
    <div className={`flex items-end gap-3 my-4 group ${!isUserModel ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center self-start mt-1 ${isUserModel ? 'bg-gray-700' : 'bg-[var(--user-message-bg)]'}`}>
        {isUserModel ? <BrandLogo className="w-5 h-5" /> : <UserIcon className="w-5 h-5 text-white" />}
      </div>
      <div 
        className={`relative max-w-2xl w-fit px-4 py-3 pb-8 shadow-md ${isUserModel ? modelBubbleClasses : userBubbleClasses}`}
        style={{ borderRadius: `var(${bubbleRadiusVar})` }}
      >
        {isUserModel && <PersonaBadge persona={message.persona} />}
        
        {renderMessageContent()}
            
        {isUserModel && textContent && !isStreaming && (
             <div className="absolute bottom-2 left-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                    onClick={() => handleCopy(textContent)}
                    className="p-1 rounded-full bg-gray-900/50 text-gray-400 hover:bg-gray-700/80 hover:text-white backdrop-blur-sm"
                    aria-label={copied ? "تم النسخ" : "نسخ النص"}
                >
                    {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                </button>
                <button 
                    onClick={() => handleSpeak(textContent)}
                    className="p-1 rounded-full bg-gray-900/50 text-gray-400 hover:bg-gray-700/80 hover:text-white backdrop-blur-sm"
                    aria-label={isSpeaking ? "إيقاف الصوت" : "تشغيل الصوت"}
                >
                    {isSpeaking ? <SpeakerOffIcon className="w-4 h-4 text-red-400" /> : <SpeakerOnIcon className="w-4 h-4" />}
                </button>
             </div>
        )}
        
        <GroundingAttribution metadata={message.groundingMetadata ?? []} />
      </div>
    </div>
  );
};