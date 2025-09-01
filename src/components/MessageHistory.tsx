import React, { useRef, useEffect } from 'react';
import type { ChatMessage, LoadingState, Persona } from '../types';
import type { AppMode } from '../App';
import { ChatMessageComponent } from './ChatMessage';
import { BrandLogo } from './BrandLogo';
import { ImageIcon, VideoIcon } from './IconComponents';

interface MessageHistoryProps {
  messages: ChatMessage[];
  loadingState: LoadingState;
  mode: AppMode;
  persona: Persona;
}

const TypingIndicator: React.FC<{ mode: AppMode }> = ({ mode }) => {
    const messages: Record<AppMode, {icon: React.ReactNode, text: string | null}> = {
        CHAT: {
            icon: <BrandLogo className="w-5 h-5 text-gray-400" />,
            text: null
        },
        IMAGE_GEN: {
            icon: <ImageIcon className="w-5 h-5 text-gray-400" />,
            text: "يقوم بإنشاء الصورة..."
        },
        VIDEO_GEN: {
            icon: <VideoIcon className="w-5 h-5 text-gray-400" />,
            text: "يقوم بإنشاء الفيديو... قد يستغرق هذا بعض الوقت."
        }
    };
    const { icon, text } = messages[mode];

    return (
        <div className="flex items-center space-x-3 py-6">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 animate-pulse">
                {icon}
            </div>
            {text ? <p className="text-sm text-gray-400 animate-pulse">{text}</p> : (
                <div className="flex items-center space-x-2" dir="ltr">
                    <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce"></div>
                </div>
            )}
        </div>
    );
};


const WelcomeMessage: React.FC<{ mode: AppMode, persona: Persona }> = ({ mode, persona }) => {
    // FIX: Added missing personas to satisfy the Record<Persona, string> type.
    const personaNames: Record<Persona, string> = {
        GEMINI: 'حمزاوي 5.0',
        GPT: 'حمزاوي 4.5',
        DEEPSEEK: 'حمزاوي 4.0',
        CLAUDE: 'حمزاوي 3.5',
        HAMZAWY_CODE: 'حمزاوي كود',
        TEACHER: 'المعلم',
    };

    const messages = {
        CHAT: {
            title: `مرحبا بك في ${personaNames[persona]}`,
            subtitle: "يمكنك أن تسألني أي شيء أو ترفق صورة للبدء.",
        },
        IMAGE_GEN: {
            title: "مولّد الصور",
            subtitle: "اكتب وصفاً دقيقاً للصورة التي تريد إنشائها.",
        },
        VIDEO_GEN: {
            title: "مولّد الفيديو",
            subtitle: "اكتب وصفاً أو أرفق صورة لإنشاء مقطع فيديو فريد.",
        },
    }
    const current = messages[mode];

    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
            <div className="bg-gray-900/30 p-8 rounded-full mb-4">
                <BrandLogo className="w-16 h-16" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)]">{current.title}</h2>
            <p>{current.subtitle}</p>
        </div>
    );
};


export const MessageHistory: React.FC<MessageHistoryProps> = ({ messages, loadingState, mode, persona }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingState]);

  const showTypingIndicator = loadingState === 'LOADING';

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 && loadingState === 'IDLE' && (
          <WelcomeMessage mode={mode} persona={persona} />
        )}
        {messages.map((msg, index) => (
          <ChatMessageComponent 
            key={msg.id} 
            message={msg}
            isLastMessage={index === messages.length -1}
            loadingState={loadingState}
          />
        ))}
        {showTypingIndicator && <TypingIndicator mode={mode} />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};