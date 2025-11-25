// Mualo-Frontend/App.js
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
import Colors from './constants/Colors';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SoundProvider } from './context/SoundContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// Import all screen components
import LoginScreen from './screens/LoginScreen';
import PrivacyConsentScreen from './screens/PrivacyConsentScreen'; // ✅ NEW
import DashboardScreen from './screens/DashboardScreen';
import LearningScreen from './screens/LearningScreen'; 
import RewardsScreen from './screens/RewardsScreen'; 
import ProfileScreen from './screens/ProfileScreen'; 
import SettingsScreen from './screens/SettingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import MasteryScreen from './screens/MasteryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function AppTabs() {
  const { currentLanguage } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Quiz') iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
          else if (route.name === 'Rewards') iconName = focused ? 'trophy' : 'trophy-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          height: 60,
          paddingTop: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarBadge: currentLanguage.toUpperCase(),
          tabBarBadgeStyle: { backgroundColor: Colors.accent }
        }}
      />
      <Tab.Screen name="Quiz" component={LearningScreen} />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Root Navigator (handles auth and consent flow)
function RootNavigator() {
  const { token, loading, hasConsent } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Mualo...</Text>
      </View>
    );
  }

  // Not logged in → Show login
  if (!token) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  // Logged in but hasn't accepted consent → Show consent screen
  if (!hasConsent) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PrivacyConsent" component={PrivacyConsentScreen} />
      </Stack.Navigator>
    );
  }

  // Logged in and consented → Show app
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppTabs" component={AppTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Mastery" component={MasteryScreen} />
    </Stack.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider>
            <SoundProvider>
              <RootNavigator />
            </SoundProvider>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', 
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
  },
});