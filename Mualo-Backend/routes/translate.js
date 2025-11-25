import express from 'express';
import { translateText } from '../services/translation.js';

const router = express.Router();

// Rate limiting middleware
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const MAX_REQUESTS = 50;

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, windowStart: now });
  } else {
    const record = rateLimit.get(ip);
    if (now - record.windowStart > RATE_LIMIT_WINDOW) {
      rateLimit.set(ip, { count: 1, windowStart: now });
    } else if (record.count >= MAX_REQUESTS) {
      return res.status(429).json({ error: 'Too many translation requests' });
    } else {
      record.count++;
    }
  }
  next();
};

// POST /translate
router.post('/', rateLimiter, async (req, res) => {
  const { text, targetLanguage } = req.body;
  
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'text and targetLanguage required' });
  }

  const supportedLanguages = ['en', 'fr', 'rw', 'sw'];
  if (!supportedLanguages.includes(targetLanguage)) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  const cacheKey = `${text.substring(0, 100)}_${targetLanguage}`;
  
  try {
    const db = req.app.get('db');
    const admin = req.app.get('admin');
    
    if (!db || !admin) {
      console.error('Firebase not properly initialized');
      return res.status(500).json({ error: 'Database not initialized' });
    }

    const cacheDoc = await db.collection('translation_cache').doc(cacheKey).get();
    
    if (cacheDoc.exists) {
      console.log('Using cached translation');
      return res.json({ 
        translation: cacheDoc.data().translatedText,
        cached: true 
      });
    }

    const translation = await translateText(text, targetLanguage);
    
    await db.collection('translation_cache').doc(cacheKey).set({
      originalText: text,
      translatedText: translation,
      targetLanguage,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      requestCount: 1
    }, { merge: true });

    res.json({ translation, cached: false });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;