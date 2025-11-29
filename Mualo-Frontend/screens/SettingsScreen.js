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
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { auth, db, doc, getDoc, updateDoc, deleteDoc } from '../config/firebaseConfig';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // User profile state
  const [userData, setUserData] = useState({
    displayName: 'Loading...',
    username: 'user',
    level: 1,
    points: 0,
  });

  const theme = darkMode ? darkTheme : lightTheme;
  const colors = theme;

  // Fetch user data on mount
  useEffect(() => {
    fetchUserSettings();
  }, []);

  // Listen to system theme changes if user hasn't set a preference
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      // Only auto-update if user hasn't explicitly set dark mode
      const userPrefersDark = darkMode;
      if (!userPrefersDark) {
        setDarkMode(colorScheme === 'dark');
      }
    });
    return () => sub.remove();
  }, [darkMode]);

  // Fetch user data and settings from Firebase
  const fetchUserSettings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to view settings');
        navigation.goBack();
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          displayName: data.username || 'User',
          username: data.username || 'user',
          level: data.level || 1,
          points: data.points || 0,
        });

        // Load saved preferences
        setPushNotifications(data.pushNotifications !== false); // Default true
        setEmailUpdates(data.emailUpdates !== false); // Default true
        setSoundEffects(data.soundEffects !== false); // Default true
        setDarkMode(data.darkMode === true); // Default false
      } else {
        // Create default settings if user doc doesn't exist
        await updateDoc(userDocRef, {
          pushNotifications: true,
          emailUpdates: true,
          soundEffects: true,
          darkMode: false,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Update setting in Firebase
  const updateSetting = async (field, value) => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        [field]: value,
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      Alert.alert('Error', `Failed to update ${field}`);
      // Revert on error
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Handle toggle changes
  const handlePushNotifications = async (value) => {
    setPushNotifications(value);
    await updateSetting('pushNotifications', value);
  };

  const handleDarkMode = async (value) => {
    setDarkMode(value);
    await updateSetting('darkMode', value);
    // Immediately apply theme change
    Appearance.setColorScheme(value ? 'dark' : 'light');
  };

  const handleEmailUpdates = async (value) => {
    setEmailUpdates(value);
    await updateSetting('emailUpdates', value);
  };

  const handleSoundEffects = async (value) => {
    setSoundEffects(value);
    await updateSetting('soundEffects', value);
  };

  // Handle Delete Account
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently remove all your data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'This is your final warning. All progress, points, and achievements will be lost forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Permanently Delete',
                  style: 'destructive',
                  onPress: deleteAccountForever,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const deleteAccountForever = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      // Delete user data from Firestore first
      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);

      // Delete user answers
      const answersQuery = query(collection(db, 'user_answers'), where('uid', '==', user.uid));
      const answersSnapshot = await getDocs(answersQuery);
      const batch = [];
      answersSnapshot.forEach((doc) => {
        batch.push(deleteDoc(doc.ref));
      });
      await Promise.all(batch);

      // Delete Firebase Auth account
      await user.delete();

      Alert.alert('Account Deleted', 'Your account has been permanently deleted.', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to login
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]);
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', `Failed to delete account: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const responsiveFont = (size) => Math.min(size, width * 0.045);

  // Show loading overlay
  if (loading && !userData.displayName) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

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
        {saving && <ActivityIndicator color={colors.accent} size="small" />}
      </View>

      {/* Profile Section */}
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={styles.avatarCircle}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {userData.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={[styles.profileName, { color: colors.textPrimary }]}>
            {userData.displayName}
          </Text>
          <Text style={[styles.profileLevel, { color: colors.textSecondary }]}>
            Creative Professional
          </Text>
          <Text style={[styles.profilePoints, { color: colors.textTertiary }]}>
            Level {userData.level} · {userData.points} points
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
          onValueChange={handlePushNotifications}
          colors={colors}
        />

        <SettingToggle
          icon="moon-outline"
          label="Dark Mode"
          value={darkMode}
          onValueChange={handleDarkMode}
          colors={colors}
        />

        <SettingToggle
          icon="mail-outline"
          label="Email Updates"
          value={emailUpdates}
          onValueChange={handleEmailUpdates}
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
          onValueChange={handleSoundEffects}
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