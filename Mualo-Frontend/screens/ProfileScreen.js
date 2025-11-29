import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext'; 

const ProfileScreen = ({ navigation }) => {
    const { userData, logout } = useAuth(); 
    const { currentLanguage, changeLanguage } = useLanguage(); 

    const displayName = userData?.displayName || 'Loading User...';
    const email = userData?.email || 'loading@mualo.com';
    const overallProgress = userData?.overallProgress || 0;
    const modulesCompleted = userData?.modulesCompleted || 0;

    const currentLangLabel = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.label; 

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
                {/* Avatar Section */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <FontAwesome5 name="user-alt" size={40} color={Colors.background} />
                    </View>
                    <Text style={styles.displayName}>{displayName}</Text>
                    <Text style={styles.emailText}>{email}</Text>
                </View>

                {/* Stats Summary*/}
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

                {/* Settings Menu  */}
                <View style={styles.settingsMenu}>
                    <Text style={styles.sectionTitle}>Account & Settings</Text>
                    
                    {/*LANGUAGE SETTING */}
                    {renderSettingItem('globe', `Language: ${currentLangLabel}`, () => {
                        Alert.alert(
                            'Select Language',
                            'Choose your preferred learning language',
                            [
                                ...SUPPORTED_LANGUAGES.map(lang => ({
                                    text: `${lang.flag} ${lang.label}`,
                                    onPress: () => changeLanguage(lang.code)
                                })),
                                { text: 'Cancel', style: 'cancel' }
                            ]
                        );
                    })}
                    
                    {renderSettingItem('edit', 'Edit Profile', () => console.log('Edit Profile'))}
                    {renderSettingItem('bell', 'Notifications', () => navigation.navigate('Notifications'))}
                    {renderSettingItem('lock', 'Privacy Settings', () => console.log('Privacy Settings'))}
                </View>
                
                {/* Support Menu */}
                <View style={styles.settingsMenu}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    {renderSettingItem('question-circle', 'Help & Support', () => console.log('Help'))}
                    {renderSettingItem('file-alt', 'Terms of Service', () => console.log('Terms'))}
                </View>

                {/* Logout Button */}
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
        backgroundColor: Colors.background,
    },
    container: {
        padding: 20,
        alignItems: 'center',
    },
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
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#FF3B30',
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