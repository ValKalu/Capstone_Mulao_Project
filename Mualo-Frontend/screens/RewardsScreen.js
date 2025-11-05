import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

// NOTE: You must define or import the actual Colors object in your local project
const Colors = {
    primary: '#4CAF50', // Green
    secondary: '#FF9800', // Orange
    text: '#333333',
    textSecondary: '#666666',
    white: '#FFFFFF',
    background: '#F5F5F5',
};

// Mock Data for Rewards
const MOCK_REWARDS = [
    { id: 1, name: "First Lesson Complete", points: 100, icon: 'zap', awarded: true },
    { id: 2, name: "Music Theory Novice", points: 500, icon: 'trophy', awarded: true },
    { id: 3, name: "Distribution Masterclass", points: 1500, icon: 'gift', awarded: false },
    { id: 4, name: "Consistent Learner (7 Days)", points: 200, icon: 'notifications', awarded: false },
    { id: 5, name: "Quiz Ace", points: 300, icon: 'document-text', awarded: true },
];
const MOCK_USER_POINTS = 8450; // Use your actual user points here

const RewardItem = ({ reward }) => {
    const cardStyle = reward.awarded 
        ? [styles.rewardCard, styles.claimedCard] 
        : styles.rewardCard;
    const iconColor = reward.awarded ? Colors.primary : Colors.textSecondary;
    const buttonText = reward.awarded ? 'Claimed' : 'Earn Now';
    const buttonStyle = reward.awarded 
        ? styles.claimedButton 
        : styles.earnButton;
    const buttonTextStyle = reward.awarded 
        ? styles.claimedButtonText 
        : styles.earnButtonText;

    return (
        <View style={cardStyle}>
            <View style={[styles.iconContainer, { backgroundColor: reward.awarded ? '#E8F5E9' : '#F7F7F7' }]}>
                <Ionicons name={reward.icon} size={24} color={iconColor} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.rewardName}>{reward.name}</Text>
                <Text style={[styles.rewardPoints, { color: reward.awarded ? Colors.primary : Colors.secondary }]}>
                    +{reward.points} Points
                </Text>
            </View>
            <TouchableOpacity 
                style={buttonStyle}
                disabled={reward.awarded}
                onPress={() => console.log(`Action for: ${reward.name}`)}
            >
                <Text style={buttonTextStyle}>{buttonText}</Text>
            </TouchableOpacity>
        </View>
    );
};

const RewardsScreen = () => {
    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Achievements & Rewards</Text>
                <Ionicons name="trophy" size={28} color={Colors.secondary} />
            </View>

            <View style={styles.content}>
                {/* Points Summary Card */}
                <View style={styles.pointsCard}>
                    <View>
                        <Text style={styles.pointsLabel}>Your Points Balance</Text>
                        <Text style={styles.pointsValue}>{MOCK_USER_POINTS}</Text>
                    </View>
                    <Ionicons name="gift" size={40} color={Colors.white} style={{ opacity: 0.8 }} />
                </View>

                {/* Achievement List */}
                <Text style={styles.listTitle}>Available Achievements</Text>
                <View style={styles.listContainer}>
                    {MOCK_REWARDS.map(reward => (
                        <RewardItem key={reward.id} reward={reward} />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50, // For notch/status bar
        paddingBottom: 15,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    content: {
        padding: 20,
    },
    pointsCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.secondary,
        padding: 20,
        borderRadius: 15,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    pointsLabel: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '500',
    },
    pointsValue: {
        color: Colors.white,
        fontSize: 36,
        fontWeight: 'bold',
        marginTop: 5,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 15,
    },
    listContainer: {
        // Space provided by RewardItem margin
    },
    rewardCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    claimedCard: {
        backgroundColor: '#F1F8E9', // Light green background for claimed
        borderColor: Colors.primary,
    },
    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    rewardName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    rewardPoints: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 3,
    },
    earnButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    earnButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    claimedButton: {
        backgroundColor: '#E0E0E0',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    claimedButtonText: {
        color: Colors.textSecondary,
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default RewardsScreen;
