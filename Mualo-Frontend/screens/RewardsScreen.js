import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db, doc, getDoc, updateDoc } from '../config/firebaseConfig';

// 
// REWARD DEFINITIONS 
// 
const REWARD_LIST = [
  {
    id: 'first_lesson',
    name: 'First Lesson Complete',
    points: 100,
    icon: 'school-outline',
    condition: (user) => user.modulesCompleted >= 1,
  },
  {
    id: 'music_theory_novice',
    name: 'Music Theory Novice',
    points: 500,
    icon: 'trophy-outline',
    condition: (user) => user.overallProgress >= 0.3,
  },
  {
    id: 'distribution_master',
    name: 'Distribution Masterclass',
    points: 1500,
    icon: 'gift-outline',
    condition: (user) => user.overallProgress >= 0.8,
  },
  {
    id: 'streak_7',
    name: 'Consistent Learner (7 Days)',
    points: 200,
    icon: 'notifications-outline',
    condition: (user) => user.streak >= 7,
  },
  {
    id: 'quiz_ace',
    name: 'Quiz Ace',
    points: 300,
    icon: 'document-text-outline',
    condition: (user) => user.totalCorrect >= 10, // e.g., 10 correct answers
  },
];

// 
// REWARD ITEM CARD
// 
const RewardItem = ({ reward, isClaimed, onClaim }) => {
  const glowAnim = new Animated.Value(0);

  const startGlow = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  if (!isClaimed) startGlow();

  const cardShadow = {
    shadowColor: isClaimed ? '#7D3C98' : '#BB86FC',
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.9],
    }),
    shadowRadius: 10,
  };

  return (
    <Animated.View style={[styles.rewardCard, cardShadow]}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={reward.icon}
          size={26}
          color={isClaimed ? '#7D3C98' : '#BB86FC'}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.rewardName}>{reward.name}</Text>
        <Text style={styles.rewardPoints}>+{reward.points} points</Text>
      </View>

      <TouchableOpacity
        style={isClaimed ? styles.claimedButton : styles.earnButton}
        disabled={isClaimed}
        onPress={() => onClaim(reward)}
      >
        <Text style={isClaimed ? styles.claimedButtonText : styles.earnButtonText}>
          {isClaimed ? 'Claimed' : 'Claim'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 
// MAIN SCREEN
// 
export default function RewardsScreen() {
  const [userData, setUserData] = useState(null);
  const [claimedRewards, setClaimedRewards] = useState([]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();

      // Count total correct answers (user_answers)
      const correctAnswers = data.totalCorrect || 0;

      setUserData({
        ...data,
        totalCorrect: correctAnswers,
      });

      setClaimedRewards(data.claimedRewards || []);
    }
  };

  // 
  // CLAIM REWARD
  // 
  const handleClaim = async (reward) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    const newClaimed = [...claimedRewards, reward.id];
    const newPoints = (userData.points || 0) + reward.points;

    await updateDoc(userRef, {
      claimedRewards: newClaimed,
      points: newPoints,
    });

    setClaimedRewards(newClaimed);
    setUserData((prev) => ({ ...prev, points: newPoints }));
  };

  if (!userData) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: '#fff' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements & Rewards</Text>
        <Ionicons name="trophy" size={30} color="#BB86FC" />
      </View>

      {/* User Points */}
      <View style={styles.pointsCard}>
        <View>
          <Text style={styles.pointsLabel}>Your Points</Text>
          <Text style={styles.pointsValue}>{userData.points}</Text>
        </View>
        <Ionicons name="gift" size={40} color="#fff" />
      </View>

      {/* Rewards List */}
      <Text style={styles.listTitle}>Your Achievements</Text>
      {REWARD_LIST.map((reward) => {
        const eligible = reward.condition(userData);
        const isClaimed = claimedRewards.includes(reward.id);

        if (!eligible && !isClaimed) return null;

        return (
          <RewardItem
            key={reward.id}
            reward={reward}
            isClaimed={isClaimed}
            onClaim={handleClaim}
          />
        );
      })}
    </ScrollView>
  );
}

// 
// STYLES
//  
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1D1B1F' },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1D1B1F',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2A2430',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },

  pointsCard: {
    backgroundColor: '#7D3C98',
    padding: 20,
    margin: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: { color: '#fff', opacity: 0.7, fontSize: 14 },
  pointsValue: { color: '#fff', fontSize: 36, fontWeight: 'bold' },

  listTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 20,
    marginBottom: 10,
  },

  rewardCard: {
    flexDirection: 'row',
    backgroundColor: '#2A2430',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    alignItems: 'center',
  },

  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#3B3241',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  textContainer: { flex: 1 },
  rewardName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  rewardPoints: { color: '#BB86FC', marginTop: 3 },

  earnButton: {
    backgroundColor: '#BB86FC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  earnButtonText: { color: '#1D1B1F', fontWeight: '700' },

  claimedButton: {
    backgroundColor: '#3A3A3A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  claimedButtonText: { color: '#999', fontWeight: '700' },
});