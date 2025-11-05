import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
import Colors from './constants/Colors';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- CRITICAL FIX: IMPORT ALL REAL SCREEN COMPONENTS ---
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
// The 'Quiz' tab uses the component from LearningScreen.js
import LearningScreen from './screens/LearningScreen'; 
// Use the name defined in the AppTabs component
import RewardsScreen from './screens/RewardsScreen'; 
import ProfileScreen from './screens/ProfileScreen'; 
// --- END CRITICAL FIX ---


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- 1. APP TABS (Bottom Navigation) ---
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Quiz') {
            iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
          } else if (route.name === 'Rewards') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary, // Purple for active
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Hide header on tab screens
        tabBarStyle: styles.tabBarStyle,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      {/* CRITICAL FIX: Use the imported LearningScreen component instead of the placeholder */}
      <Tab.Screen name="Quiz" component={LearningScreen} /> 
      {/* CRITICAL FIX: Use the imported RewardsScreen component instead of the placeholder */}
      <Tab.Screen name="Rewards" component={RewardsScreen} />
      {/* CRITICAL FIX: Use the imported ProfileScreen component instead of the placeholder */}
      <Tab.Screen name="Profile" component={ProfileScreen} /> 
    </Tab.Navigator>
  );
}

// --- 2. MAIN STACK (Auth Flow vs App Flow) ---
function RootNavigator() {
  const { token, loading } = useAuth();

  // show a visible loader while auth state is restoring
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Mualo...</Text>
      </View>
    );
  }

  const showLogin = !token;

  // IMPORTANT: We don't wrap in NavigationContainer here, only in App()
  return (
    <Stack.Navigator>
      {showLogin ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

// --- 3. EXPORTED APP WRAPPER ---
export default function App() {
  return (
    // Only wrap the entire app in NavigationContainer here
    <NavigationContainer>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
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
  tabBarStyle: {
    backgroundColor: 'white',
    height: 60,
    paddingTop: 5,
  }
});
