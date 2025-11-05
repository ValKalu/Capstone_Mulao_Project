import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');
const MAX_WIDTH = 450; // Maximum width for tablet/desktop view

// Placeholder Data
const userData = {
    name: 'Kingpin 1!',
    level: 3,
    points: 2450,
    nextLevelPoints: 500,
    progress: 75, // 2450 out of 3000 total for Level 3
};

const stats = [
    { label: 'Lessons', value: '8/12', icon: 'book-open' },
    { label: 'Day Streak', value: '5', icon: 'fire' },
    { label: 'Complete', value: '67%', icon: 'check-square' },
];

const mastery = [
    { skill: 'IP Law', percentage: 65, color: '#A020F0' }, // Deeper purple
    { skill: 'Financial Literacy', percentage: 40, color: '#A020F0' },
    { skill: 'Contracts', percentage: 80, color: '#A020F0' },
];

const achievements = [
    { title: 'Contract Master', time: '2 days ago', icon: 'trophy' },
    { title: '5-Day Streak', time: 'Today', icon: 'star' },
    { title: 'Quick Learner', time: '1 week ago', icon: 'zap' },
];

// --- Sub-Components ---

// 1. Progress Bar Component
const ProgressBar = ({ progress, label, pointsToGo }) => {
    return (
        <View style={styles.progressBarContainer}>
            <Text style={styles.progressLabel}>{label}</Text>
            <View style={styles.progressBarWrapper}>
                <View style={[
                    styles.progressBarFill, 
                    { width: `${progress}%` }
                ]} />
            </View>
            <Text style={styles.pointsToGoText}>{pointsToGo} points to go</Text>
        </View>
    );
};

// 2. Dashboard Stat Card
const StatCard = ({ label, value, icon }) => (
    <View style={styles.statCard}>
        <FontAwesome5 name={icon} size={16} color={Colors.white} style={styles.statIcon} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

// 3. AI Recommendation Card
// Pass navigation to allow the card button to navigate
const AIRecommendationCard = ({ navigation }) => (
    <View style={styles.aiCard}>
        <View style={styles.aiHeader}>
            <Feather name="compass" size={24} color={Colors.textDark} />
            <Text style={styles.aiTitle}>AI Recommendation</Text>
            <View style={styles.personalizedBadge}>
                <Text style={styles.personalizedText}>Personalized</Text>
            </View>
        </View>

        <Text style={styles.aiCourseTitle}>Complete: Artist Budgeting Fundamentals</Text>
        <Text style={styles.aiCourseDetails}>Based on your Financial Literacy progress (40%)</Text>

        {/* CONNECTED: Navigate to the Learning/Quiz tab */}
        <TouchableOpacity 
            style={styles.aiButton} 
            onPress={() => navigation.navigate('Quiz')} // Navigate to 'Quiz' screen
        >
            <FontAwesome5 name="play-circle" size={16} color={Colors.textDark} style={{ marginRight: 8 }} />
            <Text style={styles.aiButtonText}>Continue Learning</Text>
        </TouchableOpacity>
    </View>
);

// 4. Quick Action Button
const QuickActionButton = ({ label, icon, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <FontAwesome5 name={icon} size={20} color={Colors.accent} style={{ marginBottom: 8 }} />
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

// 5. Mastery Bar Component
const MasteryBar = ({ skill, percentage, color }) => (
    <View style={styles.masteryBarItem}>
        <View style={styles.masteryHeader}>
            <Text style={styles.masterySkillText}>{skill}</Text>
            <Text style={styles.masteryPercentText}>{percentage}%</Text>
        </View>
        <View style={styles.masteryBarWrapper}>
            <View style={[
                styles.masteryBarFill, 
                { width: `${percentage}%`, backgroundColor: color }
            ]} />
        </View>
    </View>
);

// 6. Achievement Item
const AchievementItem = ({ title, time, icon }) => (
    <View style={styles.achievementItem}>
        <View style={styles.achievementIconContainer}>
            <FontAwesome5 name={icon} size={18} color={Colors.accent} />
        </View>
        <View style={styles.achievementDetails}>
            <Text style={styles.achievementTitle}>{title}</Text>
            <Text style={styles.achievementTime}>{time}</Text>
        </View>
    </View>
);

// --- Main Dashboard Screen ---

const DashboardScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.fullScreenContainer}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    
                    {/* Header Section */}
                    <View style={styles.header}>
                        
                        {/* FIXED: Wrapped the profile info in a TouchableOpacity 
                            and added the navigation handler.
                        */}
                        <TouchableOpacity 
                            style={styles.userInfo} 
                            onPress={() => navigation.navigate('Profile')} // Navigate to 'Profile' tab
                        >
                            <View style={styles.profileCircle}>
                                {/* Using K initial as per screenshot */}
                                <Text style={styles.profileInitial}>K</Text>
                            </View>
                            <View>
                                <Text style={styles.greetingText}>Good afternoon, {userData.name}</Text>
                                <Text style={styles.levelText}>
                                    Level {userData.level} • {userData.points} points
                                </Text>
                            </View>
                        </TouchableOpacity>
                        
                        <View style={styles.headerIcons}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Feather name="bell" size={24} color={Colors.white} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Feather name="settings" size={24} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Main Progress Bar */}
                    <ProgressBar 
                        progress={userData.progress} 
                        label={`Progress to Level ${userData.level + 1}`}
                        pointsToGo={userData.nextLevelPoints}
                    />

                    {/* Stats Cards Row */}
                    <View style={styles.statsRow}>
                        {stats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </View>

                    {/* AI Recommendation Card - passed navigation prop */}
                    <AIRecommendationCard navigation={navigation} />

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <QuickActionButton 
                            label="Continue Learning" 
                            icon="book-reader" 
                            onPress={() => navigation.navigate('Quiz')} // Navigate to 'Quiz' tab
                        />
                        <QuickActionButton 
                            label="View Progress" 
                            icon="chart-bar" 
                            onPress={() => console.log('View Progress Pressed')} // You can map this to a specific progress screen later
                        />
                        <QuickActionButton 
                            label="Study Groups" 
                            icon="users" 
                            onPress={() => console.log('Study Groups Pressed')} 
                        />
                        <QuickActionButton 
                            label="Get Help" 
                            icon="question-circle" 
                            onPress={() => console.log('Get Help Pressed')} 
                        />
                    </View>
                    
                    {/* Your Mastery */}
                    <View style={styles.cardContainer}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Your Mastery</Text>
                            <TouchableOpacity>
                                <Feather name="chevron-right" size={20} color={Colors.accent} />
                            </TouchableOpacity>
                        </View>
                        {mastery.map((item, index) => (
                            <MasteryBar key={index} {...item} />
                        ))}
                    </View>

                    {/* Recent Achievements */}
                    <View style={styles.cardContainer}>
                        <Text style={styles.cardTitle}>Recent Achievements</Text>
                        {achievements.map((item, index) => (
                            <AchievementItem key={index} {...item} />
                        ))}
                    </View>

                    {/* Recommended for You */}
                    <Text style={styles.sectionTitle}>Recommended for You</Text>
                    <View style={styles.cardContainer}>
                        {/* Placeholder for a single Recommended Item */}
                        <TouchableOpacity style={styles.recommendedItem} onPress={() => console.log('Recommended Course')}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.recommendedTitle}>Advanced Copyright Protection</Text>
                                <Text style={styles.recommendedDetails}>IP Law • 23 min</Text>
                            </View>
                            <View style={styles.intermediateBadge}>
                                <Text style={styles.recommendedBadgeText}>intermediate</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color={Colors.white} style={{ marginLeft: 15 }} />
                        </TouchableOpacity>
                    </View>
                    
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.primary || '#6a1b9a', // Deep purple background
  },
  scrollContent: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  container: {
    width: width * 0.9, // 90% width
    maxWidth: MAX_WIDTH, // Max width constraint
  },

  // --- Header Styles ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 5, // Slight padding to match overall layout
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.accent || '#FFD700', // Yellow
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  greetingText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '600',
  },
  levelText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },

  // --- Progress Bar ---
  progressBarContainer: {
    backgroundColor: Colors.cardBackground || '#511370', // Darker purple card base
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
  },
  progressLabel: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: 10,
  },
  progressBarWrapper: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Light, transparent background
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent || '#FFD700', // Yellow fill
    borderRadius: 5,
  },
  pointsToGoText: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'right',
    fontWeight: '500',
  },

  // --- Stats Row ---
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '32%',
    backgroundColor: Colors.cardBackground || '#511370',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
      marginBottom: 5,
      color: Colors.accent, // Yellow icon color
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.7,
  },

  // --- AI Recommendation Card ---
  aiCard: {
    backgroundColor: Colors.accentLight || '#FFFACD', // Light yellow/cream base
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderLeftWidth: 5,
    borderLeftColor: Colors.accent || '#FFD700', // Solid yellow bar
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginLeft: 8,
  },
  personalizedBadge: {
    backgroundColor: Colors.accent || '#FFD700', // Yellow badge
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginLeft: 10,
  },
  personalizedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  aiCourseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 5,
  },
  aiCourseDetails: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 15,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start', // Fit content
  },
  aiButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
  },

  // --- General Card Styles ---
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors.white,
      marginBottom: 15,
      paddingHorizontal: 5,
  },
  cardContainer: {
    backgroundColor: Colors.cardBackground || '#511370',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  
  // --- Quick Actions Grid ---
  quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 30,
  },
  actionCard: {
      width: '48%', // Two per row
      backgroundColor: Colors.cardBackground || '#511370',
      padding: 15,
      borderRadius: 15,
      alignItems: 'flex-start',
      marginBottom: 15,
      borderLeftWidth: 4, 
      borderLeftColor: Colors.primaryDark || '#4a1063', 
  },
  actionLabel: {
      fontSize: 16,
      color: Colors.white,
      fontWeight: '500',
  },

  //Mastery Bar Styles
  masteryBarItem: {
      marginBottom: 15,
      paddingVertical: 5,
  },
  masteryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
  },
  masterySkillText: {
      fontSize: 14,
      color: Colors.white,
      fontWeight: '500',
  },
  masteryPercentText: {
      fontSize: 14,
      color: Colors.accent, // Yellow percent text
      fontWeight: '600',
  },
  masteryBarWrapper: {
      height: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 4,
      overflow: 'hidden',
  },
  masteryBarFill: {
      height: '100%',
      borderRadius: 4,
  },

  // Achievement Styles 
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementIconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 15,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  achievementTime: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.7,
    marginTop: 2,
  },
  

  recommendedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 3,
  },
  recommendedDetails: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.7,
  },
  intermediateBadge: {
    backgroundColor: Colors.primaryDark || '#511370', // Use a slightly darker purple
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.accent, // Yellow border
    marginLeft: 15,
  },
  recommendedBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.accent,
    textTransform: 'uppercase',
  },
});

export default DashboardScreen;
