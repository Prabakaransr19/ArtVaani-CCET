export const languages = {
  en: { name: 'English', flag: '🇬🇧' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  bn: { name: 'বাংলা', flag: '🇮🇳' },
  te: { name: 'తెలుగు', flag: '🇮🇳' },
  mr: { name: 'मराठी', flag: '🇮🇳' },
  ta: { name: 'தமிழ்', flag: '🇮🇳' },
  kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
};

export type LanguageCode = keyof typeof languages;

export const defaultLang: LanguageCode = 'en';
