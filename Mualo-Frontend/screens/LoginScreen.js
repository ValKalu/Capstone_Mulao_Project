import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ActivityIndicator, 
  Keyboard, 
  Image, 
  Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, Feather, FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext'; 
import { useSound } from '../context/SoundContext'; 
import { TouchableWithSound as TouchableOpacity } from '../components/TouchableWithSound'; 
import * as Google from 'expo-auth-session/providers/google'; 
import * as WebBrowser from 'expo-web-browser'; 


WebBrowser.maybeCompleteAuthSession();

//  ANIMATION COMPONENTS
const NOTE_COLOR = Colors.accent || '#FFD700'; // Yellow
const NOTE_COUNT = 10; 

const AnimatedMusicNote = ({ startX, delay }) => {
    const animation = React.useRef(new Animated.Value(0)).current; 
    const iconSize = React.useMemo(() => Math.random() * 15 + 18, []); 

    React.useEffect(() => {
        const Easing = require('react-native').Easing;

        const createAnimation = () => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(animation, {
                        toValue: 1,
                        duration: 9000 + Math.random() * 6000, 
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animation, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const loop = createAnimation();
        loop.start();

        return () => loop.stop();
    }, [delay, animation]);

    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -800], 
    });

    const opacity = animation.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [0, 0.6, 0.6, 0], 
    });

    const rotation = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View
            style={[
                styles.note,
                {
                    width: iconSize,
                    height: iconSize,
                    borderRadius: iconSize / 2, 
                    backgroundColor: NOTE_COLOR,
                    left: startX,
                    transform: [{ translateY }, { rotate: rotation }],
                    opacity,
                },
            ]}
        />
    );
};

const NotesBackground = () => {
    const notes = Array.from({ length: NOTE_COUNT }).map((_, index) => {
        const startX = Math.random() * 100 + '%'; 
        const delay = Math.random() * 8000; 
        
        return <AnimatedMusicNote key={index} startX={startX} delay={delay} />;
    });

    return (
        <View style={styles.notesContainer}>
            {notes}
        </View>
    );
}

const LoginScreen = ({ navigation }) => {
  const { login, signUp, error, handleGoogleLogin } = useAuth(); 
  const { playSound } = useSound(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); 
  const [loginError, setLoginError] = useState(null); 

  
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '13667358607-oc4ejfg5goe3g800u03g8g6tm50e63jf.apps.googleusercontent.com', 
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: '13667358607-an3q0tg1f0gnbrf0aauvre0fsda4svc6.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) {
        handleGoogleLogin(response.params.id_token);
    }
  }, [response]);

  useEffect(() => {
    if (error) {
      setLoginError(error);
    }
  }, [error]);

  const handleAuth = async (authFunction) => {
    Keyboard.dismiss();
    setLoginError(null);

    if (!email || !password) {
      setLoginError('Please enter email and password.');
      return;
    }

    setIsLoading(true);
    const success = await authFunction(email, password);
    setIsLoading(false);

    if (success) {
        setLoginError(null); 
    }
  };

  const handleLogin = () => handleAuth(login);
  
  const handleGoogleSignInPress = () => {
    if (!request) {
        setLoginError('Google Sign-In configuration is missing. Check your client IDs.');
        return;
    }
    setLoginError(null);
    playSound('click'); //  SIGN SOUND
    promptAsync();
  };

  return (
    <SafeAreaView style={styles.fullScreenContainer}>
      
      {/* Background Music Notes */}
      <NotesBackground /> 
      
      {/* Central Content Container */}
      <View style={styles.contentContainer}> 
        
        {/* Logo */}
        <View style={styles.logoContainer}>
            <Image 
                source={require('../assets/images/Mualo logo.png')} 
                style={styles.logoImage} 
            />
        </View>

        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.tagline}>Sign in to continue your learning journey</Text>

        {/* Display Authentication Error */}
        {(loginError) && (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                    {loginError.replace('Firebase: ', '').replace(/\((.*?)\)/g, '').trim()}
                </Text>
            </View>
        )}

        {/* Google Button - Adjusted background/text for purple background */}
        <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleSignInPress}
            disabled={isLoading || !request}
        >
            <AntDesign name="google" size={20} color={Colors.textDark || '#333'} style={{ marginRight: 10 }} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        
        {/* OR Divider - Adjusted text color for visibility */}
        <View style={styles.orDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.inputSection}>
            <View style={styles.inputGroup}>
                <Feather name="mail" size={20} color={Colors.textLight || '#999'} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={Colors.textLight || '#999'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    returnKeyType="next"
                />
            </View>
            <View style={styles.inputGroup}>
                <Feather name="lock" size={20} color={Colors.textLight || '#999'} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.textLight || '#999'}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="done"
                />
                <FontAwesome5 name="eye-slash" size={16} color={Colors.textLight || '#999'} style={styles.passwordEyeIcon} />
            </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={() => {
            playSound('click'); // SIGN IN SOUND
            handleLogin();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white || '#fff'} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Links  */}
        <TouchableOpacity 
            onPress={() => {
                playSound('click'); // 
                navigation.navigate('Register'); 
            }} 
            disabled={isLoading} 
            style={{ marginTop: 12 }}
        >
            <Text style={styles.linkTextPurpleBG}>Do you have an account? Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            onPress={() => {
                playSound('click'); 
                console.log("Forgot Password Pressed");
            }} 
            disabled={isLoading} 
            style={{ marginTop: 8 }}
        >
            <Text style={styles.linkTextPurpleBG}>Forgot your password?</Text>
        </TouchableOpacity>
        
      </View>

      {/* Help Icon */}
      <TouchableOpacity 
          style={styles.helpIconContainer}
          onPress={() => playSound('click')} 
      >
            <Feather name="help-circle" size={24} color={Colors.white || '#fff'} />
      </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.primary || '#6a1b9a', // purple background
    alignItems: 'center', // Center 
  },
  contentContainer: {
    width: '90%', // Constrain width for mobile view
    maxWidth: 400, // Max width for tablets
    padding: 25,
    alignItems: 'center',
    
  },
  notesContainer: {
    ...StyleSheet.absoluteFillObject, 
    overflow: 'hidden',
    zIndex: -1, 
  },
  note: {
    position: 'absolute',
    bottom: -50, 
  },
  logoContainer: {
    backgroundColor: Colors.accent || '#FFD700', // Yellow background M logo
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 20, 
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  logoImage: { 
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.white || '#FFFFFF', // Changed text to white 
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: Colors.white || '#ccc', // Lighter text 
    marginBottom: 30,
    textAlign: 'center',
  },
  errorContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: '#ffdddd',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffaaaa',
    alignItems: 'center',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white || '#FFFFFF',
    borderColor: Colors.border || '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  googleButtonText: {
    color: Colors.textDark || '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.white || '#FFFFFF', // white line
  },
  orText: {
    marginHorizontal: 10,
    color: Colors.white || '#FFFFFF', // Changed text to white
    fontSize: 14,
  },
  inputSection: {
    width: '100%',
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white || '#FFFFFF', // Inputs remain white
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border || '#E0E0E0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textDark || '#333',
    paddingVertical: 0,
  },
  passwordEyeIcon: {
      marginLeft: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: Colors.accent || '#FFD700', // Yellow button
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.buttonText || '#333', // Dark text for yellow button
    fontWeight: 'bold',
    fontSize: 18,
  },
  linkTextPurpleBG: {
    color: Colors.white || '#FFFFFF', // White text for visibility on purple background
    fontSize: 14,
    marginBottom: 5,
    opacity: 0.8,
  },
  helpIconContainer: {
      position: 'absolute',
      bottom: 20, 
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.primaryDark || '#511370', // darker purple for contrast
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 5,
      zIndex: 10, // Ensure it's on top
  }
});

export default LoginScreen;