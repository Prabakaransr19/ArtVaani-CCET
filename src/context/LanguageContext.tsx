"use client";

import { createContext, useState, type ReactNode, useCallback } from 'react';
import { languages, defaultLang, type LanguageCode } from '@/locales/languages';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import ta from '@/locales/ta.json';
// Import other languages here if they are created

const translations: Record<LanguageCode, typeof en> = {
  en,
  hi,
  ta,
  bn: hi as any, // Fallback to hindi for now
  te: hi as any,
  mr: hi as any,
  kn: hi as any,
};

type TranslationKey = keyof typeof en;

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<LanguageCode>(defaultLang);

  const t = useCallback((key: TranslationKey): string => {
    // Fallback to English if translation is missing
    return (translations[lang] && translations[lang][key]) || translations[defaultLang][key];
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
