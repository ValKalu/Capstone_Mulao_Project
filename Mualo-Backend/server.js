// --- 1️⃣ CONFIGURATION (MUST BE FIRST) ---
require('dotenv').config();

const express = require('express');
const fetch = require('node-fetch'); // For calling Python FastAPI
const fs = require('fs');
const path = require('path');
const admin = require('./config/firebaseAdmin'); // Firebase setup
const db = admin.firestore();

const app = express();

// --- 2️⃣ SECURITY & MIDDLEWARE ---
const cors = require('cors');
const helmet = require('helmet');
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- 3️⃣ LOAD DATASET (JSON format) ---
const datasetPath = path.join(__dirname, 'mualo_120_questions.json');
let questions = [];
try {
  questions = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  console.log(`✅ Loaded ${questions.length} questions from dataset.`);
} catch (err) {
  console.error('❌ Error loading dataset:', err.message);
}

// --- 4️⃣ SKILL MAP (must match Python model) ---
const skillMap = [
  { course: "Copyright & IP", chapter: "Copyright Basics" },
  { course: "Copyright & IP", chapter: "Registering & Rights in Rwanda" },
  { course: "Copyright & IP", chapter: "Licensing & Royalties" },
  { course: "Music Finance & Monetization", chapter: "Revenue Streams" },
  { course: "Music Finance & Monetization", chapter: "Royalties & Collections" },
  { course: "Music Finance & Monetization", chapter: "Budgeting & Taxes" },
  { course: "Contracts & Negotiation", chapter: "Types of Contracts" },
  { course: "Contracts & Negotiation", chapter: "Key Clauses & Red Flags" },
  { course: "Contracts & Negotiation", chapter: "Negotiation Tactics" },
  { course: "Digital Distribution & Marketing", chapter: "Streaming & Platforms" },
  { course: "Digital Distribution & Marketing", chapter: "Social Media & Growth" },
  { course: "Digital Distribution & Marketing", chapter: "Digital Releases & Metadata" }
];

// --- 5️⃣ ROUTES ---
// Auth routes (if you already have them)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ✅ NEW: Get next question (integrates with FastAPI RL)
app.post('/api/next-question', async (req, res) => {
  try {
    const { userId, mastery } = req.body;

    if (!userId || !Array.isArray(mastery)) {
      return res.status(400).json({ ok: false, error: "Missing userId or mastery vector" });
    }

    // 1️⃣ Ask FastAPI RL Model for next skill
    const fastapiUrl = process.env.FASTAPI_URL || "http://localhost:8000/next_action";
    const response = await fetch(fastapiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mastery })
    });

    if (!response.ok) {
      throw new Error(`FastAPI call failed: ${response.statusText}`);
    }

    const { action } = await response.json();
    const mapping = skillMap[action] || skillMap[0];

    // 2️⃣ Pick random question from that course & chapter
    const pool = questions.filter(
      q => q.course === mapping.course && q.chapter === mapping.chapter
    );
    const nextQ = pool[Math.floor(Math.random() * pool.length)];

    // 3️⃣ Log interaction in Firestore
    await db.collection('user_progress').add({
      userId,
      skillIndex: action,
      questionId: nextQ.question_id,
      course: mapping.course,
      chapter: mapping.chapter,
      timestamp: new Date(),
    });

    // 4️⃣ Respond to client
    res.json({
      ok: true,
      nextQuestion: nextQ,
      skill: mapping
    });

  } catch (err) {
    console.error("❌ Error in /api/next-question:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Simple health check
app.get('/api/test', async (req, res) => {
  try {
    const doc = await db.collection('status').doc('health').get();
    res.json({ ok: true, exists: doc.exists, data: doc.exists ? doc.data() : null });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- 6️⃣ START SERVER ---
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// --- 7️⃣ GRACEFUL SHUTDOWN ---
process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  server.close(() => process.exit(0));
});
