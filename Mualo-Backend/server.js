// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch'); // you installed v2
const fs = require('fs');
const path = require('path');
const admin = require('./config/firebaseAdmin'); // keep your existing file
const db = admin.firestore();
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Config
const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000/next_action";
const UPDATE_API = process.env.FASTAPI_UPDATE_URL || "http://127.0.0.1:8000/update";
const PORT = process.env.PORT || 5000;

// Load dataset
const datasetPath = path.join(__dirname, 'mualo_120_questions.json');
let questions = [];
try {
  questions = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  console.log(`✅ Loaded ${questions.length} questions from dataset.`);
} catch (err) {
  console.error('❌ Error loading dataset:', err.message);
}
const validQuestions = questions.filter(q => q.course && q.chapter && q.question_id);

// Skill map (keep as you had)
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

// Simple health
app.get('/api/test', (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

// Helper: safe random pick
function pickRandom(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

// POST /api/next-question
// Body: { userId: string, mastery?: number[] }  (mastery optional)
app.post('/api/next-question', async (req, res) => {
  try {
    const { userId, mastery } = req.body || {};
    if (!userId) return res.status(400).json({ ok: false, error: 'Missing userId' });

    // Ask FastAPI for next skill index (if available)
    let actionIndex = null;
    try {
      const apiRes = await fetch(FASTAPI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mastery: mastery || [] })
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (typeof json.action === 'number') actionIndex = json.action;
      } else {
        console.warn('FastAPI responded not ok:', apiRes.status);
      }
    } catch (err) {
      console.warn('⚠️ FastAPI call failed, falling back to random skill:', err.message);
    }

    if (actionIndex === null || actionIndex < 0 || actionIndex >= skillMap.length) {
      actionIndex = Math.floor(Math.random() * skillMap.length);
    }
    const mapping = skillMap[actionIndex];

    // Filter pool
    const pool = validQuestions.filter(q => q.course === mapping.course && q.chapter === mapping.chapter);
    if (!pool.length) {
      // fallback: pick any valid question
      console.warn(`No questions in skill ${mapping.course}/${mapping.chapter}. Using any question.`);
      if (!validQuestions.length) return res.status(500).json({ ok: false, error: 'No questions available' });
      // pick random global question
      const fallbackQ = pickRandom(validQuestions);
      // respond normalized
      await logProgress(userId, actionIndex, fallbackQ);
      return res.json({ ok: true, nextQuestion: normalizeQuestion(fallbackQ), skill: mapping });
    }

    const nextQ = pickRandom(pool);
    await logProgress(userId, actionIndex, nextQ);
    res.json({ ok: true, nextQuestion: normalizeQuestion(nextQ), skill: mapping });

  } catch (err) {
    console.error('Error /api/next-question:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/submit-answer
// Body: { userId, questionId, selectedIndex, correctIndex, reward (optional) }
// This saves answer, optionally notifies FastAPI to update the RL agent.
app.post('/api/submit-answer', async (req, res) => {
  try {
    const { userId, questionId, selectedIndex, correctIndex } = req.body || {};
    if (!userId || !questionId || typeof selectedIndex !== 'number') {
      return res.status(400).json({ ok: false, error: 'Missing fields' });
    }

    const correct = (typeof correctIndex === 'number') ? (selectedIndex === correctIndex) : null;
    const reward = correct ? 1 : 0;

    // Save to Firestore (user responses)
    try {
      await db.collection('user_answers').add({
        userId, questionId, selectedIndex, correctIndex, correct, reward, createdAt: new Date()
      });
    } catch (e) {
      console.warn('Firestore log failed:', e.message);
    }

    // Notify FastAPI (if it has a learn/update endpoint)
    try {
      await fetch(UPDATE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, questionId, selectedIndex, reward })
      });
    } catch (err) {
      // not fatal — log and continue
      console.warn('FastAPI update failed (non-fatal):', err.message);
    }

    res.json({ ok: true, correct, reward });
  } catch (err) {
    console.error('Error /api/submit-answer:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Utility to return normalized question object
function normalizeQuestion(q) {
  return {
    question_id: q.question_id,
    question: q.question || q.text || 'No question text',
    options: q.options && Array.isArray(q.options) && q.options.length >= 2 ? q.options : (q.choices || ["A","B","C","D"]),
    correct_answer_index: (typeof q.correct_answer_index === 'number') ? q.correct_answer_index : 0,
    course: q.course,
    chapter: q.chapter
  };
}

// Log progress helper
async function logProgress(userId, skillIndex, q) {
  try {
    await db.collection('user_progress').add({
      userId,
      skillIndex,
      questionId: q.question_id,
      course: q.course,
      chapter: q.chapter,
      timestamp: new Date(),
    });
  } catch (err) {
    console.warn('Firestore progress log failed:', err.message);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🧠 FastAPI next_action: ${FASTAPI_URL}`);
  console.log(`🧠 FastAPI update endpoint: ${UPDATE_API}`);
});
