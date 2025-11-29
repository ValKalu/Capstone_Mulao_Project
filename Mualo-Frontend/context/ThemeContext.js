import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance, Platform } from 'react-native';
import { auth, db, doc, getDoc, updateDoc } from '../config/firebaseConfig';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const savedDarkMode = userDoc.data().darkMode === true;
          setDarkMode(savedDarkMode);
          if (Platform.OS !== 'web') {
            Appearance.setColorScheme(savedDarkMode ? 'dark' : 'light');
          }
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = async (value) => {
    setDarkMode(value);
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(value ? 'dark' : 'light');
    }
    
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { darkMode: value });
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, theme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

const lightTheme = {
  background: '#F6F0FF',
  card: '#6B35C6',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0D8F5',
  textTertiary: '#CBBCEB',
  accent: '#FFD700',
  primary: '#5D2CA8',
  icon: '#E0D8F5',
  danger: '#ff4444',
  dangerBackground: '#44206E',
  success: '#4CAF50',
  error: '#f44336',
};

const darkTheme = {
  background: '#1a1a1a',
  card: '#2e1b47',
  textPrimary: '#ffffff',
  textSecondary: '#d1c4e9',
  textTertiary: '#a592d0',
  accent: '#FFD700',
  primary: '#FFD700',
  icon: '#c5aefc',
  danger: '#ff6b6b',
  dangerBackground: '#3b1f47',
  success: '#66BB6A',
  error: '#EF5350',
};