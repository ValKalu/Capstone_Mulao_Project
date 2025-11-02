import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Used for tab icons
import Colors from './constants/Colors';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';

// Add placeholder screens for the other views from your design
const QuizScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>LearningScreen</Text></View>;
const ProfileScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Profile Screen (From Profile.png)</Text></View>;
const RewardsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Rewards Screen </Text></View>;

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
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Quiz" component={QuizScreen} />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// --- 2. MAIN STACK (Auth Flow vs App Flow) ---
function RootNavigator() {
  const { token, loading } = useAuth();

  // DEV: set true to force showing the login screen for testing
  const FORCE_SHOW_LOGIN = false;

  useEffect(() => {
    console.log('[RootNavigator] loading=', loading, 'token=', token);
  }, [loading, token]);

  // show a visible loader while auth state is restoring
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const showLogin = FORCE_SHOW_LOGIN ? true : !token;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {showLogin ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}