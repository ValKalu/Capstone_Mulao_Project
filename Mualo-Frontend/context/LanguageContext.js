// Mualo-Frontend/context/LanguageContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪' },
];

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('@mualo_language');
      if (saved && SUPPORTED_LANGUAGES.some(lang => lang.code === saved)) {
        setCurrentLanguage(saved);
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (languageCode) => {
    if (!SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode)) {
      Alert.alert('Error', 'Unsupported language selected');
      return;
    }

    try {
      setIsLoading(true);
      await AsyncStorage.setItem('@mualo_language', languageCode);
      setCurrentLanguage(languageCode);
      console.log(`🌍 Language changed to: ${languageCode}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save language preference');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentLanguage,
    changeLanguage,
    isLoading,
    SUPPORTED_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};