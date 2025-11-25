import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import firebaseAdmin from "./config/firebaseAdmin.js";
import quizRouter from "./routes/quiz.js";
import translateRoutes from './routes/translate.js';

const PORT = 5000;
const FASTAPI_URL_BASE = 'http://localhost:8000';

// Initialize Firebase Admin
const admin = firebaseAdmin;
if (!admin || !admin.firestore) {
    console.error("❌ CRITICAL: Firebase Admin NOT initialized correctly");
    process.exit(1);
}

const db = admin.firestore();

const app = express();

// Attach to Express app
app.set("admin", admin);
app.set("db", db);

// Load Questions
let questions = [];
try {
    const data = readFileSync('./mualo_120_questions.json', 'utf8');
    questions = JSON.parse(data);
    console.log(`✅ SUCCESS: Loaded ${questions.length} questions from JSON`);
} catch (err) {
    console.error("❌ FATAL ERROR: Failed to load questions JSON:", err.message);
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// App Settings
app.set("questions", questions);
app.set("FASTAPI_NEXT_ACTION", `${FASTAPI_URL_BASE}/next_action`);
app.set("FASTAPI_UPDATE", `${FASTAPI_URL_BASE}/update`);

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Mualo Backend Service Running',
        endpoints: {
            quiz: '/quiz',
            translate: '/translate',
            rl_service: app.get("FASTAPI_NEXT_ACTION")
        },
        status: '✅ Firebase Admin ready'
    });
});

app.use("/quiz", quizRouter);
app.use('/translate', translateRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Node.js Express Server running on port ${PORT}`);
    console.log(`🔗 Connected to FastAPI at ${FASTAPI_URL_BASE}`);
    console.log("🔥 Firebase Admin successfully initialized!");
});