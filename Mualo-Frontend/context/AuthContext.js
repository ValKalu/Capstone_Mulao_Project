import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithCredential,
    getRedirectResult,
    // Firestore imports
    db, 
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from '../config/firebaseConfig';
import { Alert } from 'react-native';

// Create the Context
const AuthContext = createContext();

// Hook for easy access to the context
export const useAuth = () => useContext(AuthContext);

// The Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null); // User profile data

    // Helper

    // Get user document from Firestore
    const getUserDataFromFirestore = async (uid) => {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserData(docSnap.data());
                return docSnap.data();
            }
            return null;
        } catch (err) {
            console.error("Error fetching user data:", err);
            return null;
        }
    };

    // Create user document in Firestore
    const createFirestoreUserDoc = async (user, displayName, email) => {
        const userRef = doc(db, "users", user.uid);
        const data = {
            uid: user.uid,
            email: email || user.email,
            displayName: displayName || user.displayName || user.email.split('@')[0],
            level: 1,
            points: 0,
            nextLevelPoints: 1000,
            streak: 0,
            modulesCompleted: 0,
            modulesTotal: 12,
            overallProgress: 0,
            claimedRewards: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // Privacy consent fields
            hasAcceptedPrivacyPolicy: false,
            safetyMode: false,
        };
        await setDoc(userRef, data, { merge: true });
        setUserData(data);
        return data;
    };

    // Check privacy consent status
    const checkPrivacyConsent = async (uid) => {
        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                return userSnap.data().hasAcceptedPrivacyPolicy === true;
            }
            return false;
        } catch (err) {
            console.error("Error checking privacy consent:", err);
            return false;
        }
    };

    // Initial listener for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Fetch user data and consent status
                const [userData, hasConsent] = await Promise.all([
                    getUserDataFromFirestore(currentUser.uid),
                    checkPrivacyConsent(currentUser.uid)
                ]);

                // If user doesn't exist in Firestore, create them
                if (!userData) {
                    const newUserData = await createFirestoreUserDoc(currentUser, null, currentUser.email);
                    setUser({
                        uid: currentUser.uid,
                        hasConsent: false // New user must accept consent
                    });
                } else {
                    setUser({
                        uid: currentUser.uid,
                        hasConsent: hasConsent
                    });
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Authentication Actions 

    const signUp = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await createFirestoreUserDoc(user, null, email);
            return true;
        } catch (err) {
            console.error("Sign Up Error:", err);
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return true;
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        setError(null);
        try {
            await auth.signOut();
        } catch (err) {
            console.error("Logout Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Google Sign-In
    const handleGoogleLogin = async (idToken) => {
        setLoading(true);
        setError(null);
        try {
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            // Check if user exists
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                await createFirestoreUserDoc(user, user.displayName, user.email);
            }

            return true;
        } catch (err) {
            console.error("Google Login Error:", err);
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // value context
    const value = {
        token: user?.uid || null,
        loading,
        error,
        userData,
        hasConsent: user?.hasConsent || false,
        signUp,
        login,
        logout,
        handleGoogleLogin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};