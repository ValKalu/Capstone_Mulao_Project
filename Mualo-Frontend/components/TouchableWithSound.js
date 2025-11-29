import React from 'react';
import { TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { useSound } from '../context/SoundContext';

export const TouchableWithSound = ({ children, sound = 'click', onPress, ...props }) => {
  const { playSound } = useSound();

  const handlePress = (e) => {
    playSound(sound);
    if (onPress) onPress(e);
  };

  return (
    <RNTouchableOpacity onPress={handlePress} {...props}>
      {children}
    </RNTouchableOpacity>
  );
};