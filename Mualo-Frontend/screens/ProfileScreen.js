import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext'; // Assume correct path to AuthContext

const ProfileScreen = ({ navigation }) => {
    // Access user data and logout function
    const { userData, logout } = useAuth(); 

    // Default values if userData hasn't loaded yet
    const displayName = userData?.displayName || 'Loading User...';
    const email = userData?.email || 'loading@mualo.com';
    const overallProgress = userData?.overallProgress || 0;
    const modulesCompleted = userData?.modulesCompleted || 0;

    // Helper for profile links/settings
    const renderSettingItem = (icon, title, action) => (
        <TouchableOpacity style={styles.settingItem} onPress={action}>
            <FontAwesome5 name={icon} size={20} color={Colors.primary} style={styles.settingIcon} />
            <Text style={styles.settingText}>{title}</Text>
            <FontAwesome5 name="chevron-right" size={14} color={Colors.darkGray} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* --- 1. Header/Avatar Section --- */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <FontAwesome5 name="user-alt" size={40} color={Colors.background} />
                    </View>
                    <Text style={styles.displayName}>{displayName}</Text>
                    <Text style={styles.emailText}>{email}</Text>
                </View>

                {/* --- 2. Stats Summary --- */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{overallProgress}%</Text>
                        <Text style={styles.statLabel}>Overall Progress</Text>
                    </View>
                    <View style={styles.statSeparator} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{modulesCompleted}</Text>
                        <Text style={styles.statLabel}>Modules Completed</Text>
                    </View>
                </View>

                {/* --- 3. Settings Menu --- */}
                <View style={styles.settingsMenu}>
                    <Text style={styles.sectionTitle}>Account & Settings</Text>
                    {renderSettingItem('edit', 'Edit Profile', () => console.log('Edit Profile'))}
                    {renderSettingItem('bell', 'Notifications', () => console.log('Notifications'))}
                    {renderSettingItem('lock', 'Privacy Settings', () => console.log('Privacy Settings'))}
                </View>
                
                {/* --- 4. Support Menu --- */}
                <View style={styles.settingsMenu}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    {renderSettingItem('question-circle', 'Help & Support', () => console.log('Help'))}
                    {renderSettingItem('file-alt', 'Terms of Service', () => console.log('Terms'))}
                </View>


                {/* --- 5. Logout Button --- */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <FontAwesome5 name="sign-out-alt" size={18} color="white" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background, // CRITICAL: This ensures the screen is visible
    },
    container: {
        padding: 20,
        alignItems: 'center',
    },
    // Header
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        width: '100%',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    displayName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: 5,
    },
    emailText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    // Stats
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginVertical: 15,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    statSeparator: {
        width: 1,
        backgroundColor: Colors.border,
        marginHorizontal: 15,
    },
    // Settings
    settingsMenu: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 10,
        paddingHorizontal: 0,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    settingIcon: {
        marginRight: 15,
        width: 25,
    },
    settingText: {
        fontSize: 16,
        color: Colors.text,
        flex: 1,
    },
    // Logout
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#FF3B30', // Red for danger/logout
        width: '80%',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 50,
        gap: 10,
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    }
});

export default ProfileScreen;
