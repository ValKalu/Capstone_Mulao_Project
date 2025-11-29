// DashboardScreen.js 
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { TouchableWithSound as TouchableOpacity } from '../components/TouchableWithSound'; 

// Firebase imports
import {
  db,
  auth,
  onAuthStateChanged,
  doc,
  collection,
  query,
  where,
  onSnapshot,
} from '../config/firebaseConfig.js';

import { useLanguage } from '../context/LanguageContext'; 
import { LanguageQuickSelector } from '../components/LanguageSelector'; 

const { width } = Dimensions.get('window');
const MAX_WIDTH = 450;

/* 
    SUBCOMPONENTS
   */

const ProgressBar = ({ progress, label, pointsToGo }) => (
  <View style={[styles.progressBarContainer, styles.glowCard]}>
    <Text style={styles.progressLabel}>{label}</Text>

    <View style={styles.progressBarWrapper}>
      <View
        style={[
          styles.progressBarFill,
          { width: `${Math.min(Math.max(progress, 0), 100)}%` },
        ]}
      />
    </View>

    <Text style={styles.pointsToGoText}>
      {pointsToGo ? `${pointsToGo} points to go` : ''}
    </Text>
  </View>
);

const StatCard = ({ label, value, icon }) => (
  <View style={[styles.statCard, styles.glowCard]}>
    <FontAwesome5 name={icon} size={16} color={Colors.white} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const AIRecommendationCard = ({ navigation, recommended }) => (
  <View style={[styles.aiCard, styles.glowCard]}>
    <View style={styles.aiHeader}>
      <Feather name="compass" size={24} color={Colors.textDark} />
      <Text style={styles.aiTitle}>AI Recommendation</Text>
      <View style={styles.personalizedBadge}>
        <Text style={styles.personalizedText}>Personalized</Text>
      </View>
    </View>

    <Text style={styles.aiCourseTitle}>
      {recommended?.title || 'Your next recommended module'}
    </Text>

    <Text style={styles.aiCourseDetails}>
      {recommended?.details || 'Your recommendation will appear after some quizzes.'}
    </Text>

    <TouchableOpacity
      style={styles.aiButton}
      onPress={() => navigation.navigate('Quiz')}
    >
      <FontAwesome5
        name="play-circle"
        size={16}
        color={Colors.textDark}
        style={{ marginRight: 8 }}
      />
      <Text style={styles.aiButtonText}>Continue Learning</Text>
    </TouchableOpacity>
  </View>
);

const QuickActionButton = ({ label, icon, onPress }) => (
  <TouchableOpacity style={[styles.actionCard, styles.glowCard]} onPress={onPress}>
    <FontAwesome5 name={icon} size={20} color={Colors.accent} />
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
      <View
        style={[
          styles.masteryBarFill,
          {
            width: `${percentage}%`,
            backgroundColor: color || Colors.accent,
          },
        ]}
      />
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

/* 
   MAIN DASHBOARD SCREEN
   */
export default function DashboardScreen({ navigation }) {
  const bellScale = useRef(new Animated.Value(1)).current;
  const settingsScale = useRef(new Animated.Value(1)).current;

  const [user, setUser] = useState(null);
  const [mastery, setMastery] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recommended, setRecommended] = useState(null);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  /*  REAL-TIME ANSWERS LISTENER (MASTERY CALCULATION) */
  const loadUserAnswers = (uid, currentUserData) => { 
      const q = query(collection(db, 'user_answers'), where('uid', '==', uid));
      
      const unsubscribeAnswers = onSnapshot(q, (snapshot) => {
          const answers = [];
          snapshot.forEach((doc) => answers.push(doc.data()));

          const groups = {};
          answers.forEach((a) => {
              const course = a.course || 'General';
              if (!groups[course]) groups[course] = { correct: 0, total: 0 };
              groups[course].total++;
              if (a.isCorrect) groups[course].correct++;
          });

          const masteryList = Object.keys(groups).map((course) => ({
              skill: course,
              percentage: Math.round((groups[course].correct / groups[course].total) * 100),
          }));

          setMastery(masteryList);

          const ach = [];
          masteryList.forEach((m) => {
              if (m.percentage >= 80)
                  ach.push({ title: `${m.skill} Master`, time: 'Recently', icon: 'trophy' });
          });
          
          if (currentUserData && currentUserData.streak >= 5) 
              ach.push({ title: '5-Day Streak', time: `${currentUserData.streak} days`, icon: 'star' });
          
          setAchievements(ach);

          if (masteryList.length > 0) {
              const worst = masteryList.sort((a, b) => a.percentage - b.percentage)[0];
              setRecommended({
                  title: `${worst.skill} - Improve your mastery`,
                  details: `Your mastery is ${worst.percentage}%`,
              });
          }
      }, (error) => {
          console.error("Error listening to user answers:", error);
      });

      return unsubscribeAnswers;
  };

  /* REAL-TIME AUTH AND USER DATA LOADING */
  useEffect(() => {
      let unsubscribeAuth;
      let unsubscribeUserListener;
      let unsubscribeAnswersListener; 

      unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
        if (!firebaseUser) return;
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        unsubscribeUserListener = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = {
              uid: firebaseUser.uid,
              displayName: docSnap.data().displayName || 'User',
              overallProgress: docSnap.data().overallProgress || 0,
              modulesCompleted: docSnap.data().modulesCompleted || 0,
              modulesTotal: docSnap.data().modulesTotal || 12,
              streak: docSnap.data().streak || 0,
              level: docSnap.data().level || 1,
              points: docSnap.data().points || 0,
              nextLevelPoints: docSnap.data().nextLevelPoints || 1000,
            };
            setUser(userData);
            
            if (unsubscribeAnswersListener) {
                unsubscribeAnswersListener();
            }
            unsubscribeAnswersListener = loadUserAnswers(firebaseUser.uid, userData);
          } else {
              console.log("User document does not exist.");
          }
        }, (error) => {
            console.error("Error listening to user data:", error);
        });
      });

      return () => {
          if (unsubscribeAuth) unsubscribeAuth();
          if (unsubscribeUserListener) unsubscribeUserListener();
          if (unsubscribeAnswersListener) unsubscribeAnswersListener();
      };
  }, []); 

  /* ICON PRESS ANIMATION */
  const animatePress = (animRef, screen) => {
    Animated.sequence([
      Animated.timing(animRef, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.spring(animRef, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start(() => screen && navigation.navigate(screen));
  };

  /* RENDER */
  if (!user) {
    return (
      <SafeAreaView style={styles.fullScreenContainer}>
        <Text style={{ color: 'white', marginTop: 150, textAlign: 'center' }}>
          Loading Dashboard…
        </Text>
      </SafeAreaView>
    );
  }

  const firstName = user.displayName.split(' ')[0];

  return (
    <SafeAreaView style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={[styles.profileCircle, styles.glowCard]}>
                <Text style={styles.profileInitial}>{firstName[0]}</Text>
              </View>
              <View>
                <Text style={styles.greetingText}>{greeting()}, {firstName}</Text>
                <Text style={styles.levelText}>Level {user.level} • {user.points} points</Text>
              </View>
            </View>

            <View style={styles.headerIcons}>
              <Animated.View style={{ transform: [{ scale: bellScale }] }}>
                <TouchableOpacity
                  style={[styles.iconButton, styles.glowCard]}
                  onPress={() => animatePress(bellScale, 'Notifications')}
                >
                  <Feather name="bell" size={24} color={Colors.white} />
                </TouchableOpacity>
              </Animated.View>

              {/* LANGUAGE SELECTOR BETWEEN BELL AND SETTINGS */}
              <LanguageQuickSelector />

              <Animated.View style={{ transform: [{ scale: settingsScale }] }}>
                <TouchableOpacity
                  style={[styles.iconButton, styles.glowCard]}
                  onPress={() => animatePress(settingsScale, 'Settings')} 
                >
                  <Feather name="settings" size={24} color={Colors.white} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* PROGRESS BAR */}
          <ProgressBar
            progress={user.overallProgress * 100}
            label={`Progress to Level ${user.level + 1}`}
            pointsToGo={user.nextLevelPoints}
          />

          {/* STATS */}
          <View style={styles.statsRow}>
            <StatCard label="Lessons" value={`${user.modulesCompleted}/${user.modulesTotal}`} icon="book-open" />
            <StatCard label="Streak" value={user.streak} icon="fire" />
            <StatCard label="Complete" value={`${Math.round(user.overallProgress * 100)}%`} icon="check-square" />
          </View>

          {/* AI RECOMMENDATION */}
          <AIRecommendationCard navigation={navigation} recommended={recommended} />

          {/* QUICK ACTIONS */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton label="Continue Learning" icon="book-reader" onPress={() => navigation.navigate('Quiz')} />
            <QuickActionButton label="View Progress" icon="chart-bar" onPress={() => navigation.navigate('Rewards')} />
            <QuickActionButton label="Study Groups" icon="users" onPress={() => navigation.navigate('StudyGroups')} />
            <QuickActionButton label="Get Help" icon="question-circle" onPress={() => navigation.navigate('Support')} />
          </View>

          {/* MASTERY */}
          <View style={[styles.cardContainer, styles.glowCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Your Mastery</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Mastery', { masteryData: mastery })}>
                <Feather name="chevron-right" size={20} color={Colors.accent} />
              </TouchableOpacity>
            </View>

            {mastery.length === 0
              ? <Text style={{ color: 'white', opacity: 0.7 }}>No mastery results yet</Text>
              : mastery.map((m, idx) => <MasteryBar key={idx} {...m} />)}
          </View>

          {/* ACHIEVEMENTS */}
          <View style={[styles.cardContainer, styles.glowCard]}>
            <Text style={styles.cardTitle}>Recent Achievements</Text>
            {achievements.length === 0
              ? <Text style={{ color: 'white', opacity: 0.7 }}>No achievements yet</Text>
              : achievements.map((a, idx) => <AchievementItem key={idx} {...a} />)}
          </View>

          {/* RECOMMENDED */}
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <View style={[styles.cardContainer, styles.glowCard]}>
            <TouchableOpacity
              style={styles.recommendedItem}
              onPress={() => navigation.navigate('Quiz')}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.recommendedTitle}>
                  {recommended?.title || 'No recommendation yet'}
                </Text>
                <Text style={styles.recommendedDetails}>
                  {recommended?.details || 'Complete more lessons to get personalized recommendations'}
                </Text>
              </View>

              <View style={styles.intermediateBadge}>
                <Text style={styles.recommendedBadgeText}>intermediate</Text>
              </View>

              <Feather name="chevron-right" size={20} color={Colors.white} style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/*
   STYLES 
   */
const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.primary, // Deep purple background
  },
  scrollContent: { paddingVertical: 20, alignItems: 'center' },
  container: { width: width * 0.9, maxWidth: MAX_WIDTH },

  glowCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)', // Subtle gold border
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    elevation: 5,
  },

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
    backgroundColor: Colors.accent, // Gold
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileInitial: { fontSize: 20, fontWeight: 'bold', color: Colors.primary }, // Purple on gold

  greetingText: { fontSize: 18, color: Colors.white, fontWeight: '600' },
  levelText: { fontSize: 14, color: Colors.white, opacity: 0.8 },

  headerIcons: { flexDirection: 'row', alignItems: 'center' }, // ✅ CHANGED for language selector
  iconButton: {
    marginLeft: 15,
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  progressBarContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent white
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
  },
  progressLabel: { fontSize: 16, color: Colors.white, fontWeight: '600', marginBottom: 10 },
  progressBarWrapper: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: { height: '100%', backgroundColor: Colors.accent }, // Gold
  pointsToGoText: { fontSize: 14, color: Colors.white, textAlign: 'right', fontWeight: '500' },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '32%',
    backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent white
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: Colors.white },
  statLabel: { fontSize: 12, color: Colors.white, opacity: 0.7 },

  aiCard: {
    backgroundColor: Colors.white, // WHITE BACKGROUND
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderLeftWidth: 5,
    borderLeftColor: Colors.accent, // Gold accent
  },

  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  aiTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginLeft: 8 }, // Dark gray text
  personalizedBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginLeft: 10,
  },
  personalizedText: { fontSize: 10, color: Colors.primary, fontWeight: 'bold' }, // Purple text on gold
  aiCourseTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text }, // Dark gray
  aiCourseDetails: { fontSize: 14, color: Colors.text, marginTop: 5, marginBottom: 15 }, // Dark gray
  aiButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiButtonText: { fontSize: 15, fontWeight: 'bold', color: Colors.primary }, // Purple on gold

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.white, marginBottom: 15 },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent white
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  actionLabel: { color: Colors.white, fontSize: 16, fontWeight: '500' },

  cardContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent white
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  cardTitle: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },

  masteryBarItem: { marginBottom: 15 },
  masteryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  masterySkillText: { color: Colors.white, fontSize: 14 },
  masteryPercentText: { color: Colors.accent, fontWeight: '600' },
  masteryBarWrapper: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  masteryBarFill: { height: '100%' },

  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  achievementIconContainer: { width: 30, alignItems: 'center', marginRight: 15 },
  achievementTitle: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  achievementTime: { color: Colors.white, fontSize: 12, opacity: 0.7 },

  recommendedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  recommendedTitle: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  recommendedDetails: { color: Colors.white, opacity: 0.7, marginTop: 3 },
  intermediateBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.accent,
    marginLeft: 10,
  },
  recommendedBadgeText: { color: Colors.accent, fontSize: 10, textTransform: 'uppercase' },
});