import React, { useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  Easing,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');
const MAX_WIDTH = 450;

// Placeholder Data
const userData = {
  name: 'Kingpin 1!',
  level: 3,
  points: 2450,
  nextLevelPoints: 500,
  progress: 75,
};

const stats = [
  { label: 'Lessons', value: '8/12', icon: 'book-open' },
  { label: 'Day Streak', value: '5', icon: 'fire' },
  { label: 'Complete', value: '67%', icon: 'check-square' },
];

const mastery = [
  { skill: 'IP Law', percentage: 65, color: '#A020F0' },
  { skill: 'Financial Literacy', percentage: 40, color: '#A020F0' },
  { skill: 'Contracts', percentage: 80, color: '#A020F0' },
];

const achievements = [
  { title: 'Contract Master', time: '2 days ago', icon: 'trophy' },
  { title: '5-Day Streak', time: 'Today', icon: 'star' },
  { title: 'Quick Learner', time: '1 week ago', icon: 'zap' },
];

// --- Components ---
const ProgressBar = ({ progress, label, pointsToGo }) => (
  <View style={styles.progressBarContainer}>
    <Text style={styles.progressLabel}>{label}</Text>
    <View style={styles.progressBarWrapper}>
      <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
    </View>
    <Text style={styles.pointsToGoText}>{pointsToGo} points to go</Text>
  </View>
);

const StatCard = ({ label, value, icon }) => (
  <View style={styles.statCard}>
    <FontAwesome5 name={icon} size={16} color={Colors.white} style={styles.statIcon} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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

    <TouchableOpacity 
      style={styles.aiButton} 
      onPress={() => navigation.navigate('Quiz')}
    >
      <FontAwesome5 name="play-circle" size={16} color={Colors.textDark} style={{ marginRight: 8 }} />
      <Text style={styles.aiButtonText}>Continue Learning</Text>
    </TouchableOpacity>
  </View>
);

const QuickActionButton = ({ label, icon, onPress }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress}>
    <FontAwesome5 name={icon} size={20} color={Colors.accent} style={{ marginBottom: 8 }} />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const MasteryBar = ({ skill, percentage, color }) => (
  <View style={styles.masteryBarItem}>
    <View style={styles.masteryHeader}>
      <Text style={styles.masterySkillText}>{skill}</Text>
      <Text style={styles.masteryPercentText}>{percentage}%</Text>
    </View>
    <View style={styles.masteryBarWrapper}>
      <View style={[styles.masteryBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  </View>
);

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

// --- Main Screen ---
const DashboardScreen = ({ navigation }) => {
  const bellScale = useRef(new Animated.Value(1)).current;
  const settingsScale = useRef(new Animated.Value(1)).current;

  const handlePress = (animRef, targetScreen) => {
    Animated.sequence([
      Animated.timing(animRef, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.spring(animRef, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (targetScreen) navigation.navigate(targetScreen);
    });
  };

  return (
    <SafeAreaView style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.userInfo} 
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
            >
              <View style={styles.profileCircle}>
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
              <Animated.View style={{ transform: [{ scale: bellScale }] }}>
                <TouchableOpacity 
                  style={styles.iconButton} 
                  activeOpacity={0.8}
                  onPress={() => handlePress(bellScale)}
                >
                  <Feather name="bell" size={24} color={Colors.white} />
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={{ transform: [{ scale: settingsScale }] }}>
                <TouchableOpacity 
                  style={styles.iconButton}
                  activeOpacity={0.8}
                  onPress={() => handlePress(settingsScale, 'SettingsScreens')} // <-- updated
                >
                  <Feather name="settings" size={24} color={Colors.white} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* Main Progress Bar */}
          <ProgressBar 
            progress={userData.progress} 
            label={`Progress to Level ${userData.level + 1}`}
            pointsToGo={userData.nextLevelPoints}
          />

          {/* Stats */}
          <View style={styles.statsRow}>
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </View>

          {/* AI Recommendation */}
          <AIRecommendationCard navigation={navigation} />

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton label="Continue Learning" icon="book-reader" onPress={() => navigation.navigate('Quiz')} />
            <QuickActionButton label="View Progress" icon="chart-bar" onPress={() => console.log('View Progress')} />
            <QuickActionButton label="Study Groups" icon="users" onPress={() => console.log('Study Groups')} />
            <QuickActionButton label="Get Help" icon="question-circle" onPress={() => console.log('Get Help')} />
          </View>

          {/* Mastery */}
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

          {/* Achievements */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Recent Achievements</Text>
            {achievements.map((item, index) => (
              <AchievementItem key={index} {...item} />
            ))}
          </View>

          {/* Recommended */}
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.recommendedItem} onPress={() => console.log('Recommended')}>
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

// --- Styles ---
const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.primary || '#6a1b9a',
  },
  scrollContent: { paddingVertical: 20, alignItems: 'center' },
  container: { width: width * 0.9, maxWidth: MAX_WIDTH },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.accent || '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileInitial: { fontSize: 20, fontWeight: 'bold', color: Colors.textDark },
  greetingText: { fontSize: 18, color: Colors.white, fontWeight: '600' },
  levelText: { fontSize: 14, color: Colors.white, opacity: 0.8 },
  headerIcons: { flexDirection: 'row' },
  iconButton: { marginLeft: 15 },

  // Progress, cards, mastery, etc. — unchanged from your original version
  progressBarContainer: {
    backgroundColor: Colors.cardBackground || '#511370',
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
  },
  progressLabel: { fontSize: 16, color: Colors.white, fontWeight: '600', marginBottom: 10 },
  progressBarWrapper: { height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  progressBarFill: { height: '100%', backgroundColor: Colors.accent || '#FFD700', borderRadius: 5 },
  pointsToGoText: { fontSize: 14, color: Colors.white, textAlign: 'right', fontWeight: '500' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { width: '32%', backgroundColor: Colors.cardBackground || '#511370', padding: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  statIcon: { marginBottom: 5, color: Colors.accent },
  statValue: { fontSize: 20, fontWeight: 'bold', color: Colors.white },
  statLabel: { fontSize: 12, color: Colors.white, opacity: 0.7 },

  aiCard: { backgroundColor: Colors.accentLight || '#FFFACD', padding: 20, borderRadius: 15, marginBottom: 30, borderLeftWidth: 5, borderLeftColor: Colors.accent || '#FFD700' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  aiTitle: { fontSize: 16, fontWeight: '600', color: Colors.textDark, marginLeft: 8 },
  personalizedBadge: { backgroundColor: Colors.accent || '#FFD700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, marginLeft: 10 },
  personalizedText: { fontSize: 10, fontWeight: 'bold', color: Colors.textDark },
  aiCourseTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textDark, marginBottom: 5 },
  aiCourseDetails: { fontSize: 14, color: Colors.text, marginBottom: 15 },
  aiButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accent, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, alignSelf: 'flex-start' },
  aiButtonText: { fontSize: 15, fontWeight: 'bold', color: Colors.textDark },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white, marginBottom: 15, paddingHorizontal: 5 },
  cardContainer: { backgroundColor: Colors.cardBackground || '#511370', borderRadius: 15, padding: 20, marginBottom: 30 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  actionCard: { width: '48%', backgroundColor: Colors.cardBackground || '#511370', padding: 15, borderRadius: 15, alignItems: 'flex-start', marginBottom: 15 },
  actionLabel: { fontSize: 16, color: Colors.white, fontWeight: '500' },

  masteryBarItem: { marginBottom: 15, paddingVertical: 5 },
  masteryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  masterySkillText: { fontSize: 14, color: Colors.white, fontWeight: '500' },
  masteryPercentText: { fontSize: 14, color: Colors.accent, fontWeight: '600' },
  masteryBarWrapper: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  masteryBarFill: { height: '100%', borderRadius: 4 },

  achievementItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  achievementIconContainer: { width: 30, alignItems: 'center', marginRight: 15 },
  achievementDetails: { flex: 1 },
  achievementTitle: { fontSize: 16, fontWeight: '600', color: Colors.white },
  achievementTime: { fontSize: 12, color: Colors.white, opacity: 0.7, marginTop: 2 },

  recommendedItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  recommendedTitle: { fontSize: 16, fontWeight: '600', color: Colors.white, marginBottom: 3 },
  recommendedDetails: { fontSize: 13, color: Colors.white, opacity: 0.7 },
  intermediateBadge: { backgroundColor: Colors.primaryDark || '#511370', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 15, borderWidth: 1, borderColor: Colors.accent, marginLeft: 15 },
  recommendedBadgeText: { fontSize: 10, fontWeight: 'bold', color: Colors.accent, textTransform: 'uppercase' },
});

export default DashboardScreen;
