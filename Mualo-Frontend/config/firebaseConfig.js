import { initializeApp } from 'firebase/app';
// Import necessary Firestore functions
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from 'firebase/firestore'; 
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithCredential,
    getRedirectResult
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwG5t5cjMnu-U82ELZYeOQlIFv0dRjasg",
  authDomain: "muloa-capstone-project.firebaseapp.com",
  projectId: "muloa-capstone-project",
  storageBucket: "muloa-capstone-project.firebasestorage.app",
  messagingSenderId: "608868168041",
  appId: "1:608868168041:web:26952286e430d0d5de4df8",
  measurementId: "G-50NLS6TXMD"
};

//  Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore and get a reference

// Export Auth methods and the Firestore instance/utility functions 
export {
    auth, 
    db, 
    doc, 
    setDoc, 
    getDoc, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider, 
    signInWithCredential, 
    getRedirectResult 
};
