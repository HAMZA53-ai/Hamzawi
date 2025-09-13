import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { MessageHistory } from './components/MessageHistory';
import { ChatInput } from './components/ChatInput';
import { WelcomeModal } from './components/WelcomeModal';
import { Sidebar } from './components/Sidebar';
import { useChat } from './hooks/useChat';
import { useChatHistory } from './hooks/useChatHistory';
import { useSettings } from './hooks/useSettings';
import { usePersonas } from './hooks/usePersonas';
import type { PersonaId, MediaFile, PersonaDetails, NotificationType } from './types';
import { AnimatedBackground } from './components/AnimatedBackground';
import { handleNewUserOnboarding } from './services/onboardingService';
import { SettingsModal } from './components/SettingsModal';
import { PersonaEditorModal } from './components/PersonaEditorModal';
import { Notification } from './components/Notification';
import { PreWelcomeScreen } from './components/PreWelcomeScreen';


export type AppMode = 'CHAT' | 'IMAGE_GEN' | 'VIDEO_GEN';

const suggestedQuestions = [
    "ما هي أفضل طريقة لتعلم برمجة الويب؟",
    "اشرح لي مفهوم الثقوب السوداء بطريقة مبسطة.",
    "اكتب لي قصة قصيرة عن روبوت يكتشف المشاعر.",
    "ما هي عاصمة أستراليا؟",
];

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};


const App: React.FC = () => {
  const [preWelcomeDone, setPreWelcomeDone] = useState(false);
  
  const { 
    apiKey,
    userName, 
    setUserName, 
    isLoading: isLoadingSettings,
    saveFreeApiKey
  } = useSettings();

  const {
    personas,
    addPersona,
    updatePersona,
    deletePersona,
    getPersonaDetails,
  } = usePersonas();

  const { 
    sessions, 
    activeSession, 
    activeSessionId, 
    setActiveSessionId, 
    createNewSession, 
    deleteSession,
    updateSession,
    isLoadingHistory,
  } = useChatHistory(apiKey);

  const [activePersonaId, setActivePersonaId] = useState<PersonaId>('GEMINI');
  
  const activePersona = getPersonaDetails(activeSession?.personaId || activePersonaId);

  const [appMode, setAppMode] = useState<AppMode>('CHAT');
  const { loadingState, error, sendMessage } = useChat(apiKey, activeSession, activePersona, updateSession, appMode, userName);
  
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(true);
  const [isLearningModeEnabled, setIsLearningModeEnabled] = useState(false);
  const [isWebsiteCreationModeEnabled, setIsWebsiteCreationModeEnabled] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [gradientColors, setGradientColors] = useState<[string, string]>(['#a78bfa', '#ec4899']);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<PersonaDetails | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);


  const appRef = useRef<HTMLDivElement>(null);
  const customStyleRef = useRef<HTMLStyleElement | null>(null);
  const notificationTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!isLoadingHistory && !isLoadingSettings && !userName) {
      setIsWelcomeModalOpen(true);
    }
  }, [isLoadingHistory, isLoadingSettings, userName]);

  useEffect(() => {
    handleNewUserOnboarding({
      sessions,
      userName,
      isLoadingHistory,
      isLoadingSettings,
      createNewSession,
      defaultPersonaId: activePersonaId,
    });
  }, [sessions, userName, isLoadingHistory, isLoadingSettings, createNewSession, activePersonaId]);

  useEffect(() => {
    if (activeSession) {
      setActivePersonaId(activeSession.personaId);
    }
  }, [activeSession]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    customStyleRef.current = document.createElement('style');
    document.head.appendChild(customStyleRef.current);
    
    // Cleanup timeouts on unmount
    return () => {
        if (customStyleRef.current) {
            document.head.removeChild(customStyleRef.current);
        }
        notificationTimeouts.current.forEach(clearTimeout);
    };
  }, []);
  
  useEffect(() => {
    if (!activePersona) return;
    
    // Reset website creation mode if persona is not HAMZAWY_CODE
    if (activePersona.id !== 'HAMZAWY_CODE') {
        setIsWebsiteCreationModeEnabled(false);
    }

    if (activePersona.isCustom && activePersona.themeColor && customStyleRef.current) {
        const color = activePersona.themeColor;
        const rgb = hexToRgb(color);
        const rgba = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}` : 'rgba(139, 92, 246';
        
        const gradientTo = `${rgba}, 0.7)`;
        const hoverColor = `${rgba}, 0.9)`;
        const bgGradientColor = `${rgba}, 0.15)`;
        
        customStyleRef.current.innerHTML = `
            .theme-custom {
                --gradient-from: ${color};
                --gradient-to: ${gradientTo};
                --accent-color: ${color};
                --accent-hover-color: ${hoverColor};
                --user-message-bg: ${color};
                --bg-gradient: radial-gradient(circle at 100% 0%, ${bgGradientColor}, transparent 40%);
            }
        `;
    }

    if (appRef.current) {
        // Use a short timeout to ensure CSS variables from the new theme class have been applied
        setTimeout(() => {
            if (appRef.current) {
                const styles = getComputedStyle(appRef.current);
                const from = styles.getPropertyValue('--gradient-from').trim();
                const to = styles.getPropertyValue('--gradient-to').trim();
                if(from && to) {
                    setGradientColors([from, to]);
                }
            }
        }, 50);
    }
  }, [activePersona]);

    const addNotification = useCallback((message: string) => {
        setNotifications(prev => [...prev, { id: Date.now(), message }]);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

  const handleWelcomeModalClose = (name: string, action?: 'default' | 'activate_free') => {
    setIsWelcomeModalOpen(false);
    if (name) {
        setUserName(name);
        
        if (action === 'activate_free') {
            saveFreeApiKey();
        }
        
        // Clear any previous timeouts before setting new ones
        notificationTimeouts.current.forEach(clearTimeout);
        notificationTimeouts.current = [];

        const timeout1 = setTimeout(() => {
            addNotification(`تلقي المبرمج حمزة محمد سعيد انك يا "${name}" تستخدم نماذج حمزاوي`);
        }, 15000); // 15 seconds

        const timeout2 = setTimeout(() => {
            const time = new Date().toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit' });
            addNotification(`تم تحديث جميع نماذج حمزاوي في ${time} من المبرمج`);
        }, 30000); // 30 seconds

        notificationTimeouts.current.push(timeout1, timeout2);
    }
  };

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  const handleNewChat = useCallback(() => {
    createNewSession(activePersonaId);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [createNewSession, activePersonaId]);

  const handlePersonaChange = useCallback((newPersonaId: PersonaId) => {
    setActivePersonaId(newPersonaId);
    createNewSession(newPersonaId);
  }, [createNewSession]);
  
  const handleSetAppMode = (mode: AppMode) => {
    setAppMode(mode);
  };

  const handleSelectChat = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
     if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [setActiveSessionId]);
  
  const handleSelectQuestion = useCallback((question: string) => {
    setPrompt(question);
  }, []);
  
  const handleSend = (promptToSend: string, media?: MediaFile) => {
    sendMessage(promptToSend, media, isSearchEnabled, isThinkingEnabled, isLearningModeEnabled, isWebsiteCreationModeEnabled);
    setPrompt('');
  };

  const handleSavePersona = (personaToSave: PersonaDetails) => {
    if (editingPersona && editingPersona.id === personaToSave.id) {
        updatePersona(personaToSave.id, personaToSave);
    } else {
        addPersona(personaToSave);
    }
    setEditingPersona(null);
  };

  const handleEditPersona = (personaId: PersonaId) => {
    const personaToEdit = getPersonaDetails(personaId);
    if (personaToEdit && personaToEdit.isCustom) {
        setEditingPersona(personaToEdit);
    }
  };

  const handleDeletePersona = (personaId: PersonaId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الشخصية؟')) {
        deletePersona(personaId);
        if (activePersonaId === personaId) {
            setActivePersonaId('GEMINI'); // Revert to default
        }
    }
  };

  if (!preWelcomeDone) {
    return <PreWelcomeScreen onStartRegistration={() => setPreWelcomeDone(true)} />;
  }
  
  if (!activePersona) {
    return null; // Or a loading indicator
  }

  const themeClass = activePersona.isCustom ? 'theme-custom' : activePersona.themeClass;
  
  const renderInputComponent = () => {
    return (
      <ChatInput 
        prompt={prompt}
        onPromptChange={setPrompt}
        onSend={handleSend} 
        loading={loadingState !== 'IDLE'}
        mode={appMode}
        personas={personas}
        activePersona={activePersona}
        onPersonaChange={handlePersonaChange}
        onEditPersona={handleEditPersona}
        onDeletePersona={handleDeletePersona}
        onCreatePersona={() => setEditingPersona({} as PersonaDetails)}
        isSearchEnabled={isSearchEnabled}
        onToggleSearch={() => setIsSearchEnabled(p => !p)}
        isThinkingEnabled={isThinkingEnabled}
        onToggleThinking={() => setIsThinkingEnabled(p => !p)}
        isLearningModeEnabled={isLearningModeEnabled}
        onToggleLearningMode={() => setIsLearningModeEnabled(p => !p)}
        isWebsiteCreationModeEnabled={isWebsiteCreationModeEnabled}
        onToggleWebsiteCreationMode={() => setIsWebsiteCreationModeEnabled(p => !p)}
      />
    );
  };

  return (
    <div ref={appRef} className={`${themeClass} h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-500 flex`}>
      <AnimatedBackground gradientColors={gradientColors} />
      {isWelcomeModalOpen && <WelcomeModal onClose={handleWelcomeModalClose} />}
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      {editingPersona !== null && (
        <PersonaEditorModal 
            isOpen={true} 
            onClose={() => setEditingPersona(null)} 
            onSave={handleSavePersona}
            persona={editingPersona}
        />
      )}
      
      <div className="fixed top-5 end-5 z-50 space-y-3">
        {notifications.map(notification => (
            <Notification
                key={notification.id}
                message={notification.message}
                onClose={() => removeNotification(notification.id)}
            />
        ))}
      </div>
      
      <Sidebar 
        onNewChat={handleNewChat}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectChat={handleSelectChat}
        onDeleteChat={deleteSession}
        isOpen={isSidebarOpen}
        appMode={appMode}
        onSetAppMode={handleSetAppMode}
        notifications={notifications}
        onRemoveNotification={removeNotification}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />
      
      {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}

      <main className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out">
        <Header 
            activePersona={activePersona}
            onToggleSidebar={toggleSidebar}
        />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <MessageHistory 
            messages={activeSession?.messages ?? []} 
            loadingState={loadingState} 
            mode={appMode}
            persona={activePersona}
            userName={userName}
            suggestedQuestions={suggestedQuestions}
            onSelectQuestion={handleSelectQuestion}
          />
          <div className="w-full max-w-4xl mx-auto p-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-center">
                <p><strong>حدث خطأ:</strong> {error}</p>
              </div>
            )}
            {renderInputComponent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
