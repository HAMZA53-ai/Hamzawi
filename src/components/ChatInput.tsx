import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { ImageFile } from '../types';
import type { AppMode } from '../App';
import { SendIcon, PaperclipIcon, XIcon } from './IconComponents';

interface ChatInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSend: (prompt: string, image?: ImageFile) => void;
  loading: boolean;
  mode: AppMode;
}

const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({ data: base64Data, mimeType: file.type });
    };
    reader.onerror = error => reject(error);
  });
};

const getPlaceholderText = (mode: AppMode) => {
    switch(mode) {
        case 'CHAT':
            return 'اسأل حمزاوي أي شيء...';
        case 'IMAGE_GEN':
            return 'صف الصورة التي تريد إنشائها...';
        case 'VIDEO_GEN':
            return 'صف الفيديو الذي تريد إنشائه...';
        default:
            return 'اكتب رسالتك...';
    }
}

export const ChatInput: React.FC<ChatInputProps> = ({ prompt, onPromptChange, onSend, loading, mode }) => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSend = useCallback(() => {
    if ((prompt.trim() || image) && !loading) {
      onSend(prompt.trim(), image || undefined);
      // Parent component will clear the prompt by passing an empty string
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [prompt, image, loading, onSend]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const { data, mimeType } = await fileToBase64(file);
        setImage({ data, mimeType });
        setImagePreview(URL.createObjectURL(file));
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const showAttachmentButton = mode === 'CHAT' || mode === 'VIDEO_GEN';

  return (
    <div className="bg-[var(--panel-color)] border border-[var(--border-color)] rounded-2xl p-2 flex flex-col transition-all duration-300 focus-within:ring-2 focus-within:ring-[var(--accent-color)] backdrop-blur-md">
        {imagePreview && (
            <div className="relative group p-2">
                <img src={imagePreview} alt="Image preview" className="max-h-32 rounded-lg object-contain" />
                <button onClick={removeImage} className="absolute top-3 end-3 bg-gray-900/70 rounded-full p-1 text-gray-300 hover:text-white hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100">
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        )}
      <div className="flex items-end p-2">
        {showAttachmentButton && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="p-2 text-[var(--text-muted-color)] hover:text-[var(--accent-color)] disabled:opacity-50 transition-colors"
              aria-label="Attach file"
            >
              <PaperclipIcon className="w-6 h-6" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
            />
          </>
        )}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={getPlaceholderText(mode)}
          className="flex-1 bg-transparent text-[var(--text-color)] placeholder-[var(--text-muted-color)] resize-none focus:outline-none max-h-48 px-2"
          rows={1}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || (!prompt.trim() && !image)}
          className="p-2 rounded-full bg-[var(--accent-color)] text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-[var(--accent-hover-color)] transition-all ms-2"
          aria-label="Send message"
        >
            {loading ? 
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div> :
                <SendIcon className="w-6 h-6" />
            }
        </button>
      </div>
    </div>
  );
};