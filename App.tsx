
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MessageHistory } from './components/MessageHistory';
import { ChatInput } from './components/ChatInput';
import { ChatToolbar } from './components/ChatToolbar';
import { WelcomeModal } from './components/WelcomeModal';
import { Sidebar } from './components/Sidebar';
import { useChat } from './hooks/useChat';
import { useChatHistory } from './hooks/useChatHistory';
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
    updateSession 
  } = useChatHistory();
  
  const [appMode, setAppMode] = useState<AppMode>('CHAT');
  const { loadingState, error, sendMessage } = useChat(activeSession, updateSession, appMode);
  
  const [persona, setPersona] = useState<Persona>('GEMINI');
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  
  useEffect(() => {
    if (activeSession) {
      setPersona(activeSession.persona);
    }
  }, [activeSession]);

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
            />
          )}
          <ChatInput 
            onSend={(prompt, image) => sendMessage(prompt, image, isSearchEnabled)} 
            loading={loadingState !== 'IDLE'}
            mode={appMode}
          />
        </div>
      </div>
    );
  };
  
  return (
    <div className={`theme-${persona.toLowerCase().replace('_', '-')} h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-500 flex`}>
      {isWelcomeModalOpen && <WelcomeModal onClose={handleWelcomeModalClose} />}
      
      <Sidebar 
        onNewChat={handleNewChat}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectChat={handleSelectChat}
        onDeleteChat={deleteSession}
        isOpen={isSidebarOpen}
        appMode={appMode}
        onSetAppMode={setAppMode}
      />
      
      {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}

      <main className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out">
        <Header 
            currentPersona={persona}
            onPersonaChange={handlePersonaChange}
            onToggleSidebar={toggleSidebar}
        />
        {renderContent()}
      </main>
    </div>
  );
};

export default App;