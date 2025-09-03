import { useState, useEffect, useCallback } from 'react';

const USER_SETTINGS_KEY = 'hamzawi_user_settings';

interface UserSettings {
  name: string | null;
  notificationsEnabled: boolean;
}

const defaultSettings: UserSettings = {
  name: null,
  notificationsEnabled: false,
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(USER_SETTINGS_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Failed to load user settings:", error);
      setSettings(defaultSettings);
    }
  }, []);

  const saveSettings = useCallback((newSettings: UserSettings) => {
    try {
      localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save user settings:", error);
    }
  }, []);

  const setUserName = useCallback((name: string | null) => {
    saveSettings({ ...settings, name: name ? name.trim() : null });
  }, [settings, saveSettings]);

  const setNotificationsEnabled = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (enabled) {
      if (!('Notification' in window)) {
        alert("This browser does not support desktop notification");
        saveSettings({ ...settings, notificationsEnabled: false });
        return false;
      }
      
      if (Notification.permission === 'granted') {
         saveSettings({ ...settings, notificationsEnabled: true });
         return true;
      }

      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          saveSettings({ ...settings, notificationsEnabled: true });
          return true;
        }
      }
      
      saveSettings({ ...settings, notificationsEnabled: false });
      return false;

    } else {
      saveSettings({ ...settings, notificationsEnabled: false });
      return false;
    }
  }, [settings, saveSettings]);

  return {
    userName: settings.name,
    setUserName,
    notificationsEnabled: settings.notificationsEnabled,
    setNotificationsEnabled,
  };
};