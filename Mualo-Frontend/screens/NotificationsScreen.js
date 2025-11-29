import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useSound } from '../context/SoundContext'; 
import { TouchableWithSound as TouchableOpacity } from '../components/TouchableWithSound'; 

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Achievement Unlocked!', message: 'You mastered the "Python Basics" module.', icon: 'trophy' },
  { id: '2', title: 'New Recommendation', message: 'The AI suggests a quiz on "Data Structures."', icon: 'compass' },
  { id: '3', title: 'Streak Alert', message: 'You are on a 7-day learning streak!', icon: 'fire' },
  { id: '4', title: 'Group Update', message: 'A new message was posted in your "JS Study Group".', icon: 'users' },
];

const NotificationItem = ({ title, message, icon, onPress }) => (
  <TouchableOpacity style={styles.notificationCard} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Feather name={icon} size={20} color={Colors.accent} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.messageText}>{message}</Text>
    </View>
    <Feather name="chevron-right" size={20} color={Colors.white} style={{ opacity: 0.5 }} />
  </TouchableOpacity>
);

export default function NotificationsScreen({ navigation }) {
  const { playSound } = useSound(); 

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>🔔 Notifications</Text>
      
      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem 
            {...item} 
            onPress={() => {
              playSound('click'); 
              console.log('Notification pressed:', item.id);
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Feather name="bell-off" size={40} color={Colors.white} style={{ opacity: 0.5, marginBottom: 15 }} />
                <Text style={styles.emptyText}>You are all caught up! No new notifications.</Text>
            </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary, 
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.1)', // Light gold background
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  messageText: {
    color: Colors.white,
    fontSize: 14,
    opacity: 0.7,
    marginTop: 3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: Colors.white,
    opacity: 0.6,
    fontSize: 16,
    textAlign: 'center',
  },
});