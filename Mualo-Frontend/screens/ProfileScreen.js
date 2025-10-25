import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native'; 
import Colors from '../constants/Colors';

// screen components 
import DashboardScreen from '../screens/DashboardScreen';
import LearningScreen from '../screens/LearningScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// --- 1. QUIZ WRAPPER COMPONENT (Forces LearningScreen to Quiz Mode) ---
const QuizWrapper = (props) => {
    // Passes the prop to tell LearningScreen to display the quiz first.
    return <LearningScreen {...props} initialMode="quiz" />;
}

// --- 2. REWARDS WRAPPER EXAMPLE (If you wanted to start Rewards on Achievements) ---
// This is an example of how you could pass an initial mode to the RewardsScreen
/*
const RewardsWrapper = (props) => {
    return <RewardsScreen {...props} initialMode="achievements" />;
}
*/
// We will just use the RewardsScreen directly for now, as no mode is specified.


const AppTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.darkGray,
                tabBarStyle: {
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    paddingBottom: 5,
                },
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    
                    if (route.name === 'Dashboard') {
                        iconName = 'home-outline';
                    } else if (route.name === 'Quiz') { // Used to be 'Learning'
                        iconName = 'ios-document-text-outline'; 
                    } else if (route.name === 'Rewards') {
                        iconName = 'star-outline';
                    } else if (route.name === 'Profile') {
                        iconName = 'person-circle-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            {/* The Quiz tab uses the wrapper to force the LearningScreen into quiz view */}
            <Tab.Screen name="Quiz" component={QuizWrapper} /> 
            
            {/* Rewards and Profile are pointed directly to their respective screens */}
            <Tab.Screen name="Rewards" component={RewardsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default AppTabs;
