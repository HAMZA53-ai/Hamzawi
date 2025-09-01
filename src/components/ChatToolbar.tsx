import React from 'react';
import { SparklesIcon, SearchIcon } from './IconComponents';

interface ChatToolbarProps {
    isSearchEnabled: boolean;
    onToggleSearch: () => void;
    isDeepThinkingEnabled: boolean;
    onToggleDeepThinking: () => void;
}

const ToggleSwitch: React.FC<{
    id: string;
    checked: boolean;
    onChange: () => void;
    label: string;
    icon: React.ReactNode;
}> = ({ id, checked, onChange, label, icon }) => (
    <label htmlFor={id} className="flex items-center cursor-pointer">
        <div className="relative">
            <input
                id={id}
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={onChange}
            />
            <div className={`block w-12 h-6 rounded-full transition-colors ${checked ? 'bg-[var(--accent-color)]' : 'bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
        <div className="ms-3 text-sm font-medium text-gray-300 flex items-center gap-1.5">
            {icon}
            {label}
        </div>
    </label>
);


export const ChatToolbar: React.FC<ChatToolbarProps> = ({ isSearchEnabled, onToggleSearch, isDeepThinkingEnabled, onToggleDeepThinking }) => {
    return (
        <div className="flex justify-end items-center px-4 pb-2 gap-x-6 gap-y-2 flex-wrap">
            <ToggleSwitch
                id="deep-thinking-toggle"
                checked={isDeepThinkingEnabled}
                onChange={onToggleDeepThinking}
                label="تفكير عميق"
                icon={<SparklesIcon className="w-4 h-4 text-yellow-300"/>}
            />
            <ToggleSwitch
                id="google-search-toggle"
                checked={isSearchEnabled}
                onChange={onToggleSearch}
                label="بحث Google"
                icon={<SearchIcon className="w-4 h-4 text-blue-300"/>}
            />
        </div>
    );
};