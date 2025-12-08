import React, { useState, createContext } from 'react';
import { TRANSLATIONS } from './constants';

export const LanguageContext = createContext<any>(null);

export const LanguageProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [language, setLanguage] = useState('en');
  const t = (key: string) => TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
};