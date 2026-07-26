import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    AsyncStorage.getItem('app_lang').then(storedLang => {
      if (storedLang && dictionaries[storedLang]) {
        setLang(storedLang);
      }
      setIsLoaded(true);
    });
  }, []);

  const changeLang = async (newLang) => {
    if (dictionaries[newLang]) {
      setLang(newLang);
      await AsyncStorage.setItem('app_lang', newLang);
    }
  };

  const t = (key, params = {}) => {
    const dictionary = dictionaries[lang] || dictionaries['uz'];
    let text = dictionary[key] !== undefined ? dictionary[key] : (uz[key] !== undefined ? uz[key] : undefined);
    if (text === undefined || text === null) return null;
    
    // Replace params (e.g. {count} or {year})
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  };

  if (!isLoaded) return null;

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
