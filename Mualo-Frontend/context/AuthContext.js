import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithCredential,
    getRedirectResult,
    // --- NEW FIREBASE IMPORTS ---
    db, 
    doc,
    setDoc,
    getDoc
    // ----------------------------
} from '../config/firebaseConfig.js'; // Ensure this path is correct

// 1. Create the Context
const AuthContext = createContext();

// Hook for easy access to the context
export const useAuth = () => useContext(AuthContext);

// 2. The Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null); // <-- NEW: State for user's profile data

    // --- NEW FIREBASE HELPER FUNCTIONS ---

    // Helper to get user document from Firestore
    const getUserDataFromFirestore = async (uid) => {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            } else {
                setUserData(null);
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
        }
    };

    // Helper to create user document in Firestore (called on signup/first google login)
    const createFirestoreUserDoc = async (user, displayName, email) => {
        const userRef = doc(db, "users", user.uid);
        const data = {
            uid: user.uid,
            email: email || user.email,
            displayName: displayName || user.displayName || user.email.split('@')[0], // Use email prefix if no name
            overallProgress: 0,
            modulesCompleted: 0,
            createdAt: new Date().toISOString(),
        };
        // Use merge: true to avoid overwriting existing fields if they sign in again later
        await setDoc(userRef, data, { merge: true });
        return data;
    };

    // -------------------------------------

    // Initial listener to set user state on load/change
    useEffect(() => {
        // Subscribe to the Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Use UID as the simple token for navigation
                setUser(currentUser.uid);
                // --- NEW: Fetch user data on successful sign-in/restore ---
                await getUserDataFromFirestore(currentUser.uid);
                // ---------------------------------------------------------
            } else {
                setUser(null);
                setUserData(null); // Clear data on logout
            }
            setLoading(false);
        });

        // Cleanup subscription on component unmount
        return unsubscribe;
    }, []);

    // --- Authentication Actions ---

    const signUp = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // --- NEW: Create initial document in Firestore ---
            const data = await createFirestoreUserDoc(user, null, email);
            setUserData(data);
            // ------------------------------------------------

            // onAuthStateChanged handler above will update the user state
            return true;
        } catch (err) {
            console.error("Sign Up Error:", err);
            setError(err.message);
            setUser(null);
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
            // onAuthStateChanged handler above will update the user state and fetch userData
            return true;
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message);
            setUser(null);
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
            // onAuthStateChanged handler will update the user state to null
        } catch (err) {
            console.error("Logout Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Google Sign-In helper (uses ID token acquired from Expo)
    const handleGoogleLogin = async (idToken) => {
        setLoading(true);
        setError(null);
        try {
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            // --- NEW: Check/Create user document in Firestore ---
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                 // First-time Google sign-in: create user document
                 const data = await createFirestoreUserDoc(user, user.displayName, user.email);
                 setUserData(data);
            }
            // ------------------------------------------------

            return true;
        } catch (err) {
            console.error("Google Login Error:", err);
            setError(err.message);
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    };
    
    // Check for redirect result (important for web testing)
    const checkRedirect = async () => {
        setLoading(true);
        try {
            await getRedirectResult(auth);
        } catch (error) {
            // Handle error in the redirect flow
            console.error("Redirect Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // The value provided by the context
    const value = {
        token: user, // token is the user's UID or null
        loading,
        error,
        userData, // <-- NEW: Export user profile data
        signUp,
        login,
        logout,
        handleGoogleLogin,
        checkRedirect,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Wait for initial authentication state to load before rendering children */}
            {!loading && children} 
        </AuthContext.Provider>
    );
};
