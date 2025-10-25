const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get the database and constants
const db = admin.firestore();
const JWT_SECRET = process.env.JWT_SECRET;
const usersCollection = db.collection('users');

// Hash complexity
const saltRounds = 10; 

// --- 1. REGISTRATION ROUTE (POST /api/auth/register) ---
router.post('/register', async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ message: 'Please provide email, password, and username.' });
    }

    try {
        // Check if user already exists
        const userCheck = await usersCollection.where('email', '==', email).get();
        if (!userCheck.empty) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // Hash the password for security
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Define initial user data (aligned with your project proposal structure)
        const userData = {
            email: email.toLowerCase(),
            username,
            level: 1,
            points: 0,
            mastery: { // Initial mastery scores for RL/KT
                financialLiteracy: 0,
                contracts: 0,
                legal: 0,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        //  Store user (using email as the document ID for easy lookup)
        await usersCollection.doc(email).set({ 
            ...userData,
            passwordHash: hashedPassword // Store the hash
        });

        // Respond with success
        res.status(201).json({ message: 'User registered successfully. Proceed to login.' });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// LOGIN ROUTE (POST /api/auth/login) 
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        // Find user by email (using it as document ID)
        const userDoc = await usersCollection.doc(email.toLowerCase()).get();
        if (!userDoc.exists) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = userDoc.data();

        // Compare submitted password with stored hash
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // payload for JWT (DO NOT INCLUDE PASSWORD HASH!)
        const tokenPayload = { 
            userId: userDoc.id, 
            email: user.email, 
            level: user.level 
        };
        
        //   JWT (expires in 24 hours)
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

        // Send token and basic user data back to the client
        res.status(200).json({
            token,
            user: {
                email: user.email,
                username: user.username,
                level: user.level
            },
            message: 'Login successful.'
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});


module.exports = router;