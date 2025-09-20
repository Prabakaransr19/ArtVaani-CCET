"use client";

import { LanguageContext } from '@/context/LanguageContext';
import { useContext } from 'react';

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
