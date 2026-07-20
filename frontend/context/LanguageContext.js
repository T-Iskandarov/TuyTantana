'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import uz from '../locales/uz.json';
import kaa from '../locales/kaa.json';
import en from '../locales/en.json';
import ru from '../locales/ru.json';

const dictionaries = { uz, kaa, en, ru };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('uz');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedLang = localStorage.getItem('site_lang');
    if (storedLang && dictionaries[storedLang]) {
      setLang(storedLang);
    }
    setIsLoaded(true);
  }, []);

  const changeLang = (newLang) => {
    if (dictionaries[newLang]) {
      setLang(newLang);
      localStorage.setItem('site_lang', newLang);
    }
  };

  const t = (key, params = {}) => {
    const dictionary = dictionaries[lang] || dictionaries['uz'];
    let text = dictionary[key] || uz[key] || key;
    
    // Replace params (e.g. {count} or {year})
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  };

  // Prevent hydration errors by not rendering until lang is loaded from localStorage
  if (!isLoaded) return null;

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
