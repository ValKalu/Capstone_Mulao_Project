// Mualo-Frontend/screens/PrivacyConsentScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db, doc, setDoc } from '../config/firebaseConfig';
import Colors from '../constants/Colors'; 

export default function PrivacyConsentScreen({ navigation }) {
  const [agree, setAgree] = useState(false);
  const [safetyMode, setSafetyMode] = useState(false);

  const handleAccept = async () => {
    if (!agree) {
      Alert.alert('Required', 'You must agree to continue');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    // Store consent in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      hasAcceptedPrivacyPolicy: true,
      safetyMode: safetyMode,
      privacyAcceptedAt: new Date(),
    }, { merge: true });

    navigation.replace('AppTabs');
  };

  const handleDecline = () => {
    Alert.alert('Decline & Exit', 'You must accept the privacy policy to use MUALO.', [
      { text: 'OK', onPress: () => auth.signOut() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome to MUALO!</Text>
        
        <Text style={styles.section}>MUALO is your AI music business mentor. To personalize your learning, I need to remember your progress—but I never know who you are.</Text>
        
        <Text style={styles.heading}>What I Collect:</Text>
        <Text style={styles.bullet}>✅ Email (for login only)</Text>
        <Text style={styles.bullet}>✅ Quiz scores (to teach you better)</Text>
        <Text style={styles.bullet}>✅ Progress badges (to motivate you)</Text>

        <Text style={styles.heading}>What I NEVER Collect:</Text>
        <Text style={styles.bullet}>❌ Your songs, contacts, or location</Text>
        <Text style={styles.bullet}>❌ Your personal stories or payment info</Text>

        <Text style={styles.heading}>How I Use It:</Text>
        <Text style={styles.text}>My AI brain (DQN) sees only numbers (e.g., Copyright mastery: 60). No names. No files.</Text>

        <Text style={styles.heading}>Your Rights:</Text>
        <Text style={styles.bullet}>🗑️ Delete everything instantly: Profile → Settings → Delete My Data (4 seconds)</Text>
        <Text style={styles.bullet}>📧 Access your data: Email privacy@mualo.alu.dev</Text>

        <Text style={styles.heading}>Safety Mode (For Women):</Text>
        <Text style={styles.text}>Toggle this to hide your name from leaderboards and anonymize your data. No questions asked.</Text>

        <Text style={styles.heading}>Research:</Text>
        <Text style={styles.text}>Youre helping prove AI can democratize African education. You can opt out anytime in Settings.</Text>

        <Text style={styles.heading}>Age:</Text>
        <Text style={styles.text}>I am at least 16 years old.</Text>

        {/* CHECKBOXES */}
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgree(!agree)}>
          <Text style={styles.checkbox}>{agree ? '☑' : '☐'}</Text>
          <Text style={styles.checkboxLabel}>I understand and agree</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setSafetyMode(!safetyMode)}>
          <Text style={styles.checkbox}>{safetyMode ? '☑' : '☐'}</Text>
          <Text style={styles.checkboxLabel}>I want Safety Mode ON</Text>
        </TouchableOpacity>

        {/* BUTTONS */}
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.buttonText}>Agree & Start</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
          <Text style={styles.declineButtonText}>Disagree & Exit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.white, marginBottom: 20, textAlign: 'center' },
  heading: { fontSize: 16, fontWeight: 'bold', color: Colors.accent, marginTop: 15, marginBottom: 5 },
  bullet: { fontSize: 14, color: Colors.white, marginLeft: 10, marginBottom: 3 },
  text: { fontSize: 14, color: Colors.white, marginBottom: 10, lineHeight: 20 },
  section: { fontSize: 14, color: Colors.white, marginBottom: 15, lineHeight: 20 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  checkbox: { fontSize: 24, marginRight: 10, color: Colors.white },
  checkboxLabel: { fontSize: 14, color: Colors.white, flex: 1 },
  acceptButton: {
    backgroundColor: Colors.accent,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: { color: Colors.primary, fontWeight: 'bold', fontSize: 16 },
  declineButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors,   
  },
  declineButtonText: { color: Colors.white, fontWeight: 'bold', fontSize: 16 },
});