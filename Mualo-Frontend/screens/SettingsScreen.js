import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Appearance,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const navigation = useNavigation();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const [theme, setTheme] = useState(Appearance.getColorScheme());

  // auto update if user changes OS theme
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => console.log('Account deleted') },
      ]
    );
  };

  const responsiveFont = (size) => Math.min(size, width * 0.045);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Settings
        </Text>
      </View>

      {/* Profile Section */}
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={styles.avatarCircle}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>K</Text>
        </View>
        <View>
          <Text style={[styles.profileName, { color: colors.textPrimary }]}>
            Kingpin 1
          </Text>
          <Text style={[styles.profileLevel, { color: colors.textSecondary }]}>
            Creative Professional
          </Text>
          <Text style={[styles.profilePoints, { color: colors.textTertiary }]}>
            Level 3 · 2,450 points
          </Text>
        </View>
      </View>

      {/* Account Section */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>Account</Text>

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={22} color={colors.icon} />
          <Text style={[styles.rowText, { color: colors.textPrimary }]}>
            Edit Profile
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('ChangeAvatar')}
          activeOpacity={0.7}
        >
          <Ionicons name="camera-outline" size={22} color={colors.icon} />
          <Text style={[styles.rowText, { color: colors.textPrimary }]}>
            Change Avatar
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>
          Preferences
        </Text>

        <SettingToggle
          icon="notifications-outline"
          label="Push Notifications"
          value={pushNotifications}
          onValueChange={setPushNotifications}
          colors={colors}
        />

        <SettingToggle
          icon="moon-outline"
          label="Dark Mode"
          value={darkMode}
          onValueChange={setDarkMode}
          colors={colors}
        />

        <SettingToggle
          icon="mail-outline"
          label="Email Updates"
          value={emailUpdates}
          onValueChange={setEmailUpdates}
          colors={colors}
        />
      </View>

      {/* Learning */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>
          Learning
        </Text>
        <SettingToggle
          icon="volume-high-outline"
          label="Sound Effects"
          value={soundEffects}
          onValueChange={setSoundEffects}
          colors={colors}
        />
      </View>

      {/* Support */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>Support</Text>

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('HelpCenter')}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle-outline" size={22} color={colors.icon} />
          <Text style={[styles.rowText, { color: colors.textPrimary }]}>
            Help Center
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('PrivacyPolicy')}
          activeOpacity={0.7}
        >
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.icon} />
          <Text style={[styles.rowText, { color: colors.textPrimary }]}>
            Privacy Policy
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.dangerBackground, borderColor: colors.danger },
        ]}
      >
        <TouchableOpacity style={styles.row} onPress={handleDeleteAccount} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
          <Text style={[styles.rowText, { color: colors.danger }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ---------- COMPONENT: SettingToggle ---------- */
const SettingToggle = ({ icon, label, value, onValueChange, colors }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={22} color={colors.icon} />
    <Text style={[styles.rowText, { color: colors.textPrimary }]}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      thumbColor={value ? colors.accent : '#ccc'}
      trackColor={{ false: '#767577', true: '#b388ff' }}
    />
  </View>
);

/* ---------- THEMES ---------- */
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
};

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  avatarCircle: {
    backgroundColor: '#FFD700',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontWeight: 'bold', fontSize: 22 },
  profileName: { fontSize: 18, fontWeight: 'bold' },
  profileLevel: { fontSize: 14 },
  profilePoints: { fontSize: 12 },
  sectionCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontWeight: '600', fontSize: 16, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowText: { flex: 1, marginLeft: 10, fontSize: 15 },
});
