import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, translations } from './translations';

const LANGUAGE_KEY = '@lectio_language';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Helper to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value === undefined || value === null) return undefined;
    value = value[key];
  }
  return typeof value === 'string' ? value : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage && ['es', 'de', 'en'].includes(savedLanguage)) {
          setLanguageState(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }, []);

  // Translation function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const translationSet = translations[language];
      let value = getNestedValue(translationSet, key);

      // Fallback to Spanish if key not found
      if (value === undefined) {
        value = getNestedValue(translations.es, key);
      }

      // Return key if still not found
      if (value === undefined) {
        return key;
      }

      // Replace parameters
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          const paramValue = params[paramKey];
          return paramValue !== undefined ? String(paramValue) : match;
        });
      }

      return value;
    },
    [language]
  );

  if (isLoading) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
