import { useState, useEffect, useCallback } from 'react';
import type { ChatSession, Persona, ChatHistory } from '../types';
import { generateTitleForChat } from '../services/geminiService';

const STORAGE_KEY = 'hamzawi_chat_history';

export const useChatHistory = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      const loadedSessions = storedHistory ? JSON.parse(storedHistory) : [];
      setSessions(loadedSessions);

      if (loadedSessions.length > 0 && !activeSessionId) {
        setActiveSessionId(loadedSessions[0].id);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      setSessions([]);
    }
  }, []);

  const saveSessionsToStorage = (updatedSessions: ChatSession[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  };

  const createNewSession = useCallback((persona: Persona) => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: 'محادثة جديدة',
      timestamp: Date.now(),
      persona,
      messages: [],
    };
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setActiveSessionId(newSession.id);
    saveSessionsToStorage(updatedSessions);
    return newSession;
  }, [sessions]);

  const deleteSession = useCallback((sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    saveSessionsToStorage(updatedSessions);
    
    if (activeSessionId === sessionId) {
      setActiveSessionId(updatedSessions.length > 0 ? updatedSessions[0].id : null);
    }
  }, [sessions, activeSessionId]);

  const updateSession = useCallback(async (
    sessionOrUpdater: ChatSession | ((prev: ChatSession) => ChatSession)
  ) => {
    let sessionToUpdate: ChatSession | null = null;
    
    setSessions(prevSessions => {
      const activeIndex = prevSessions.findIndex(s => s.id === activeSessionId);
      if (activeIndex === -1) return prevSessions;

      const prevSession = prevSessions[activeIndex];
      const newSession = typeof sessionOrUpdater === 'function' ? sessionOrUpdater(prevSession) : sessionOrUpdater;
      
      sessionToUpdate = newSession; // Capture for async title generation

      const updatedSessions = [...prevSessions];
      updatedSessions[activeIndex] = newSession;
      
      saveSessionsToStorage(updatedSessions);
      return updatedSessions;
    });

    // Handle async title generation after the state update
    if (sessionToUpdate && sessionToUpdate.messages.length === 1 && sessionToUpdate.title === 'محادثة جديدة') {
      const firstUserMessage = sessionToUpdate.messages[0].parts.find(p => p.text)?.text;
      if (firstUserMessage) {
        const newTitle = await generateTitleForChat(firstUserMessage);
        setSessions(prevSessions => {
          const updated = prevSessions.map(s => s.id === activeSessionId ? { ...s, title: newTitle } : s);
          saveSessionsToStorage(updated);
          return updated;
        });
      }
    }
  }, [activeSessionId]);
  
  const clearAllHistory = useCallback(() => {
    setSessions([]);
    setActiveSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearActiveSessionMessages = useCallback(() => {
    if (!activeSessionId) return;
    setSessions(prevSessions => {
        const updatedSessions = prevSessions.map(s => {
            if (s.id === activeSessionId) {
                return { ...s, messages: [] };
            }
            return s;
        });
        saveSessionsToStorage(updatedSessions);
        return updatedSessions;
    });
  }, [activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    updateSession,
    clearAllHistory,
    clearActiveSessionMessages,
  };
};
