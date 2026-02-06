import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, FontFamily, ViewMode, TextAlignment, TranslationStyle } from '../types';
import { defaultFont } from '../constants/fonts';

const SETTINGS_KEY = '@bivium_settings';

const defaultSettings: UserSettings = {
  fontFamily: defaultFont.value,
  fontSize: 18,
  lineHeight: 1.6,
  theme: 'system',
  viewMode: 'parallel',
  textAlignment: 'left',
  translationStyle: 'inline',
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

  const setFontFamily = useCallback((fontFamily: FontFamily) => {
    saveSettings({ fontFamily });
  }, [saveSettings]);

  const setFontSize = useCallback((fontSize: number) => {
    saveSettings({ fontSize });
  }, [saveSettings]);

  const setLineHeight = useCallback((lineHeight: number) => {
    saveSettings({ lineHeight });
  }, [saveSettings]);

  const setViewMode = useCallback((viewMode: ViewMode) => {
    saveSettings({ viewMode });
  }, [saveSettings]);

  const setTextAlignment = useCallback((textAlignment: TextAlignment) => {
    saveSettings({ textAlignment });
  }, [saveSettings]);

  const setTranslationStyle = useCallback((translationStyle: TranslationStyle) => {
    saveSettings({ translationStyle });
  }, [saveSettings]);

  return {
    settings,
    isLoading,
    saveSettings,
    setFontFamily,
    setFontSize,
    setLineHeight,
    setViewMode,
    setTextAlignment,
    setTranslationStyle,
  };
}
