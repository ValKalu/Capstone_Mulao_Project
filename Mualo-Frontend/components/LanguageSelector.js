// Mualo-Frontend/components/LanguageSelector.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'; // ✅ ADDED Alert
import { Picker } from '@react-native-picker/picker';
import { useLanguage } from '../context/LanguageContext';
import Colors from '../constants/Colors';

const LanguageSelector = ({ compact = false }) => {
  const { currentLanguage, changeLanguage, SUPPORTED_LANGUAGES } = useLanguage();

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {!compact && (
        <Text style={styles.label}>🌍 Learning Language</Text>
      )}
      
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={currentLanguage}
          onValueChange={changeLanguage}
          style={styles.picker}
          dropdownIconColor={Colors.accent}
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <Picker.Item 
              key={lang.code}
              label={`${lang.flag} ${lang.label}`}
              value={lang.code}
              style={styles.pickerItem}
            />
          ))}
        </Picker>
      </View>

      {compact && currentLang && (
        <Text style={styles.currentLangText}>
          {currentLang.flag} {currentLang.label}
        </Text>
      )}
    </View>
  );
};

// Quick selector for header - FIXED
export const LanguageQuickSelector = () => {
  const { currentLanguage, changeLanguage, SUPPORTED_LANGUAGES } = useLanguage();

  return (
    <TouchableOpacity 
      style={styles.quickSelector}
      onPress={() => {
        Alert.alert(
          'Language',
          'Select your language',
          [
            ...SUPPORTED_LANGUAGES.map(lang => ({
              text: `${lang.flag} ${lang.label}`,
              onPress: () => changeLanguage(lang.code)
            })),
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }}
    >
      <Text style={styles.languageBadge}>
        {currentLanguage.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  compactContainer: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  pickerWrapper: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: Colors.textDark,
  },
  pickerItem: {
    fontSize: 16,
  },
  currentLangText: {
    color: Colors.accent,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  quickSelector: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.accent,
  },
});

export default LanguageSelector;