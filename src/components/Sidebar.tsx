import React from 'react';
import { BrandLogo } from './BrandLogo';
import { PlusIcon, ChatIcon, ImageIcon, TrashIcon, VideoIcon } from './IconComponents';
import { UserSettingsPopover } from './UserSettingsPopover';
import type { ChatSession } from '../types';
import type { AppMode } from '../App';

interface SidebarProps {
    onNewChat: () => void;
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSelectChat: (sessionId: string) => void;
    onDeleteChat: (sessionId: string) => void;
    isOpen: boolean;
    appMode: AppMode;
    onSetAppMode: (mode: AppMode) => void;
    userName: string | null;
    setUserName: (name: string) => void;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
}

const ChatHistoryItem: React.FC<{ session: ChatSession; active: boolean; onSelect: () => void; onDelete: (e: React.MouseEvent) => void; }> = ({ session, active, onSelect, onDelete }) => (
    <div className={`group flex items-center gap-3 w-full text-start rounded-lg transition-colors pr-3 ${active ? 'bg-gray-700/80 text-white' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}>
        <button onClick={onSelect} className="flex-1 flex items-center gap-3 py-2 pl-3 text-sm truncate">
            <ChatIcon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{session.title}</span>
        </button>
        <button onClick={onDelete} className="p-1 rounded-md text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="حذف المحادثة">
            <TrashIcon className="w-4 h-4" />
        </button>
    </div>
);

const ModeSwitcher: React.FC<{ appMode: AppMode, onSetAppMode: (mode: AppMode) => void }> = ({ appMode, onSetAppMode }) => (
    <div className="flex items-center bg-gray-900/50 rounded-lg p-1 space-x-1 mb-4">
        <button 
            onClick={() => onSetAppMode('CHAT')}
            className={`flex-1 flex items-center justify-center gap-2 text-sm px-2 py-1.5 rounded-md transition-all ${appMode === 'CHAT' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>
            <ChatIcon className="w-4 h-4" />
            محادثة
        </button>
        <button 
            onClick={() => onSetAppMode('IMAGE_GEN')}
            className={`flex-1 flex items-center justify-center gap-2 text-sm px-2 py-1.5 rounded-md transition-all ${appMode === 'IMAGE_GEN' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>
            <ImageIcon className="w-4 h-4" />
            صور
        </button>
        <button 
            onClick={() => onSetAppMode('VIDEO_GEN')}
            className={`flex-1 flex items-center justify-center gap-2 text-sm px-2 py-1.5 rounded-md transition-all ${appMode === 'VIDEO_GEN' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>
            <VideoIcon className="w-4 h-4" />
            فيديو
        </button>
    </div>
);


export const Sidebar: React.FC<SidebarProps> = ({ 
    onNewChat, sessions, activeSessionId, onSelectChat, onDeleteChat, isOpen, appMode, onSetAppMode,
    userName, setUserName, notificationsEnabled, setNotificationsEnabled 
}) => {
    return (
        <aside className={`
            bg-gray-900/70 backdrop-blur-lg border-e h-dvh flex flex-col flex-shrink-0 overflow-hidden
            fixed md:relative top-0 bottom-0 start-0 z-40 
            transition-transform duration-300 ease-in-out
            w-64 border-[var(--border-color)]
            ${isOpen 
                ? 'translate-x-0' 
                : 'translate-x-full md:translate-x-0 md:w-0 md:border-transparent'
            }
        `}>
             <div className={`flex flex-col flex-1 overflow-hidden min-w-[14.5rem] p-3 ${isOpen ? '' : 'md:hidden'}`}>
                <div className="flex items-center gap-3 px-2 pb-3 mb-3 border-b border-[var(--border-color)] flex-shrink-0">
                    <BrandLogo className="w-9 h-9" />
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] whitespace-nowrap">
                        شات حمزاوي
                    </h1>
                </div>
                <button
                    onClick={onNewChat}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-200 rounded-lg transition-all w-full mb-2 flex-shrink-0"
                    aria-label="محادثة جديدة"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span className="whitespace-nowrap">محادثة جديدة</span>
                </button>
                
                <ModeSwitcher appMode={appMode} onSetAppMode={onSetAppMode} />

                <div className="flex-1 overflow-y-auto space-y-1 pr-1 -mr-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase px-3 pt-2 pb-1 whitespace-nowrap">المحادثات السابقة</p>
                    {sessions.map(session => (
                        <ChatHistoryItem 
                            key={session.id}
                            session={session}
                            active={session.id === activeSessionId}
                            onSelect={() => onSelectChat(session.id)}
                            onDelete={(e) => { e.stopPropagation(); onDeleteChat(session.id); }}
                        />
                    ))}
                </div>

                <div className="flex-shrink-0 pt-3 mt-2 border-t border-[var(--border-color)] flex justify-between items-center">
                    <p className="text-sm text-gray-400 px-2 truncate">
                        {userName ? `أهلاً, ${userName}` : 'مستخدم زائر'}
                    </p>
                    <UserSettingsPopover
                        userName={userName}
                        setUserName={setUserName}
                        notificationsEnabled={notificationsEnabled}
                        setNotificationsEnabled={setNotificationsEnabled}
                    />
                </div>
            </div>
        </aside>
    );
};