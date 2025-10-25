const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

try {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(__dirname, '../serviceAccountKey.json');

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use ADC
    admin.initializeApp();
  } else {
    const raw = fs.readFileSync(keyPath, 'utf8');
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  console.log('Firebase Admin initialized');
} catch (err) {
  console.error('Failed to initialize Firebase Admin:', err);
  process.exit(1);
}

module.exports = admin;