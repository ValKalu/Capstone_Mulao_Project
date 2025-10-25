// --- 1. CONFIGURATION (MUST BE FIRST) ---
require('dotenv').config();

// initialize firebase-admin (must run before routes that use admin)
const admin = require('./config/firebaseAdmin');

const express = require('express');
const app = express();
const db = admin.firestore();

// optional security / CORS
// const cors = require('cors');
// const helmet = require('helmet');
// app.use(helmet());
// app.use(cors());

app.use(express.json());

// import routes AFTER admin is initialized
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// test route
app.get('/api/test', async (req, res) => {
  try {
    const doc = await db.collection('status').doc('health').get();
    res.json({ ok: true, exists: doc.exists, data: doc.exists ? doc.data() : null });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

// graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down');
  server.close(() => process.exit(0));
});