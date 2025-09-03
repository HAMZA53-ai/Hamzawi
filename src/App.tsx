import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MessageHistory } from './components/MessageHistory';
import { ChatInput } from './components/ChatInput';
import { ChatToolbar } from './components/ChatToolbar';
import { WelcomeModal } from './components/WelcomeModal';
import { Sidebar } from './components/Sidebar';
import { useChat } from './hooks/useChat';
import { useChatHistory } from './hooks/useChatHistory';
import { useUserSettings } from './hooks/useUserSettings';
import type { Persona } from './types';

export type AppMode = 'CHAT' | 'IMAGE_GEN' | 'VIDEO_GEN';

const App: React.FC = () => {
  const { 
    sessions, 
    activeSession, 
    activeSessionId, 
    setActiveSessionId, 
    createNewSession, 
    deleteSession,
    updateSession,
    clearActiveSessionMessages
  } = useChatHistory();

  const {
    userName,
    setUserName,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useUserSettings();
  
  const [appMode, setAppMode] = useState<AppMode>('CHAT');
  const { loadingState, error, sendMessage } = useChat(
    activeSession, 
    updateSession, 
    appMode,
    userName,
    notificationsEnabled
  );
  
  const [persona, setPersona] = useState<Persona>('GEMINI');
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isDeepThinkingEnabled, setIsDeepThinkingEnabled] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  useEffect(() => {
    if (sessions.length === 0) {
      setIsWelcomeModalOpen(true);
    } else {
      setIsWelcomeModalOpen(false);
    }
  }, [sessions]);
  
  useEffect(() => {
    if (activeSession) {
      setPersona(activeSession.persona);
    }
  }, [activeSession]);

  useEffect(() => {
    const themeClass = `theme-${persona.toLowerCase().replace('_', '-')}`;
    const themes = ['gemini', 'gpt', 'deepseek', 'claude', 'hamzawy-code', 'teacher'].map(t => `theme-${t}`);
    document.body.classList.remove(...themes);
    document.body.classList.add(themeClass);
  }, [persona]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleWelcomeModalClose = () => {
    setIsWelcomeModalOpen(false);
    if (sessions.length === 0) {
      createNewSession(persona);
    }
  };

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    createNewSession(persona);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [createNewSession, persona]);

  const handlePersonaChange = useCallback((newPersona: Persona) => {
    setPersona(newPersona);
    createNewSession(newPersona);
  }, [createNewSession]);

  const handleSelectChat = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
     if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [setActiveSessionId]);

  const handleClearChat = () => {
    if (activeSession && activeSession.messages.length > 0) {
        setIsClearConfirmOpen(true);
    }
  };

  const confirmClearChat = () => {
      clearActiveSessionMessages();
      setIsClearConfirmOpen(false);
  };
  
  const renderContent = () => {
    return (
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <MessageHistory 
          messages={activeSession?.messages ?? []} 
          loadingState={loadingState} 
          mode={appMode}
          persona={persona}
        />
        <div className="w-full max-w-4xl mx-auto p-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-center">
              <p><strong>حدث خطأ:</strong> {error}</p>
            </div>
          )}
          {appMode === 'CHAT' && (
            <ChatToolbar 
              isSearchEnabled={isSearchEnabled}
              onToggleSearch={() => setIsSearchEnabled(p => !p)}
              isDeepThinkingEnabled={isDeepThinkingEnabled}
              onToggleDeepThinking={() => setIsDeepThinkingEnabled(p => !p)}
            />
          )}
          <ChatInput 
            onSend={(prompt, image) => sendMessage(prompt, image, isSearchEnabled, isDeepThinkingEnabled)} 
            loading={loadingState !== 'IDLE'}
            mode={appMode}
          />
        </div>
      </div>
    );
  };
  
  return (
    <div className={`h-screen text-[var(--text-color)] transition-colors duration-500 flex font-sans`}>
      {isWelcomeModalOpen && (
        <WelcomeModal 
          onClose={handleWelcomeModalClose} 
          userName={userName}
          onNameChange={setUserName}
        />
      )}

      {isClearConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
                <h2 className="text-lg font-bold text-white mb-2">تأكيد</h2>
                <p className="text-gray-400 mb-6">هل أنت متأكد أنك تريد مسح جميع الرسائل في هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء.</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setIsClearConfirmOpen(false)}
                        className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={confirmClearChat}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        مسح المحادثة
                    </button>
                </div>
            </div>
        </div>
      )}
      
      <Sidebar 
        onNewChat={handleNewChat}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectChat={handleSelectChat}
        onDeleteChat={deleteSession}
        isOpen={isSidebarOpen}
        appMode={appMode}
        onSetAppMode={setAppMode}
        userName={userName}
        setUserName={setUserName}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
      />
      
      {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}

      <main className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out">
        <Header 
            currentPersona={persona}
            onPersonaChange={handlePersonaChange}
            onToggleSidebar={toggleSidebar}
            onClearChat={handleClearChat}
        />
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
