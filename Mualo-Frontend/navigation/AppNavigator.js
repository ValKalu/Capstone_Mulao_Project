import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons'; // Changed from Ionicons to FontAwesome5
import Colors from '../constants/Colors';


// screen components (Ensure these paths are correct relative to this file)
import DashboardScreen from '../screens/DashboardScreen';
import LearningScreen from '../screens/LearningScreen'; // Used for the "Quiz" tab
import RewardsScreen from '../screens/RewardsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const AppTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: Colors.primary || '#4CAF50',
                tabBarInactiveTintColor: Colors.darkGray || '#9E9E9E',
                tabBarStyle: {
                    backgroundColor: Colors.background || '#F5F5F5',
                    paddingTop: 5,
                    height: 60,
                    borderTopWidth: 1,
                    borderTopColor: Colors.border || '#E0E0E0',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    paddingBottom: 5,
                },
                tabBarIcon: ({ color, size }) => { 
                    let iconName;
                    
                    if (route.name === 'Dashboard') {
                        iconName = 'home';
                    } else if (route.name === 'Quiz') { 
                        // The name used in navigation is 'Quiz', but the component is LearningScreen
                        iconName = 'book-reader'; 
                    } else if (route.name === 'Rewards') {
                        iconName = 'trophy'; 
                    } else if (route.name === 'Profile') {
                        iconName = 'user-circle';
                    }

                    return <FontAwesome5 name={iconName} size={size} color={color} />;
                },
            })}
        >
            {/* Note: The 'Quiz' name correctly maps to LearningScreen */}
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Quiz" component={LearningScreen} />
            <Tab.Screen name="Rewards" component={RewardsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default AppTabs;
