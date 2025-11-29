// Mualo-Frontend/config/auth.js
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';
import { auth } from './firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

// ✅ YOUR ACTUAL CLIENT IDs (extracted from your LoginScreen.js)
const WEB_CLIENT_ID = '13667358607-oc4ejfg5goe3g800u03g8g6tm50e63jf.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '13667358607-an3q0tg1f0gnbrf0aauvre0fsda4svc6.apps.googleusercontent.com';

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: WEB_CLIENT_ID, // Required for both web & mobile
    androidClientId: ANDROID_CLIENT_ID, // Mobile-specific
  });

  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: Firebase popup flow
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
      } else {
        // Mobile: Expo Auth Session → Firebase
        const result = await promptAsync();
        
        if (result.type === 'success') {
          const { id_token } = result.params;
          const credential = GoogleAuthProvider.credential(id_token);
          const userCredential = await signInWithCredential(auth, credential);
          return userCredential.user;
        } else {
          throw new Error('Google Sign-In cancelled');
        }
      }
    } catch (error) {
      console.error('❌ Google Auth Error:', error);
      throw error;
    }
  };

  return { signInWithGoogle, request };
};