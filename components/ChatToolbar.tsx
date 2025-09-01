import React from 'react';
import { SparklesIcon } from './IconComponents';

interface ChatToolbarProps {
    isSearchEnabled: boolean;
    onToggleSearch: () => void;
}

export const ChatToolbar: React.FC<ChatToolbarProps> = ({ isSearchEnabled, onToggleSearch }) => {
    return (
        <div className="flex justify-end items-center px-4 pb-2">
            <label htmlFor="deep-search-toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                    <input 
                        id="deep-search-toggle" 
                        type="checkbox" 
                        className="sr-only" 
                        checked={isSearchEnabled}
                        onChange={onToggleSearch}
                    />
                    <div className={`block w-12 h-6 rounded-full transition-colors ${isSearchEnabled ? 'bg-[var(--accent-color)]' : 'bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isSearchEnabled ? 'translate-x-6' : ''}`}></div>
                </div>
                <div className="ms-3 text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <SparklesIcon className="w-4 h-4 text-yellow-300"/>
                    البحث والتفكير العميق
                </div>
            </label>
        </div>
    );
};