// Mualo-Frontend/context/SoundContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { auth, db, doc, getDoc, updateDoc } from '../config/firebaseConfig';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [soundObjects, setSoundObjects] = useState({});

  useEffect(() => {
    loadSoundSettings();
    preloadSounds();
  }, []);

  const loadSoundSettings = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setSoundEnabled(userDoc.data().soundEffects !== false);
        }
      }
    } catch (error) {
      console.error('Error loading sound settings:', error);
    }
  };

  const preloadSounds = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const sounds = {};
      const soundFiles = {
        click: require('../assets/sounds/click.mp3'),
        correct: require('../assets/sounds/correct.mp3'),
        wrong: require('../assets/sounds/wrong.mp3'),
        reward: require('../assets/sounds/reward.mp3'),
      };

      for (const [key, file] of Object.entries(soundFiles)) {
        try {
          const { sound } = await Audio.Sound.createAsync(file);
          sounds[key] = sound;
          console.log(`✅ Sound loaded: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Sound '${key}' failed to load:`, error.message);
          sounds[key] = null; // Set null instead of mock object
        }
      }

      setSoundObjects(sounds);
      setSoundsLoaded(true);
    } catch (error) {
      console.error('Sound system error:', error);
      setSoundsLoaded(false);
    }
  };

  const playSound = async (type) => {
    if (!soundEnabled || !soundsLoaded || !soundObjects[type]) return;
    
    try {
      const sound = soundObjects[type];
      await sound.stopAsync(); // Stop first to reset position
      await sound.playFromPositionAsync(0); // Play from start
    } catch (error) {
      console.warn(`Error playing ${type} sound:`, error.message);
    }
  };

  const toggleSound = async (value) => {
    setSoundEnabled(value);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { soundEffects: value });
      }
    } catch (error) {
      console.error('Error saving sound setting:', error);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(soundObjects).forEach(sound => {
        if (sound) {
          sound.unloadAsync().catch(() => {});
        }
      });
    };
  }, [soundObjects]);

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playSound, soundsLoaded }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);