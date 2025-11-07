
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// 1️⃣ Determine key file path
const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.resolve(__dirname, '../serviceAccountKey.json');

try {
  let appConfig = {};

  // (Application Default Credentials)
  if (fs.existsSync(keyPath)) {
    const raw = fs.readFileSync(keyPath, 'utf8');
    const serviceAccount = JSON.parse(raw);

    appConfig = {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    };

    admin.initializeApp(appConfig);
    console.log('✅ Firebase Admin initialized using local serviceAccountKey.json');
  } else {
    // 3️⃣ Fallback to Application Default Credentials (for cloud envs like Render/GCP)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('✅ Firebase Admin initialized using Application Default Credentials');
  }
} catch (err) {
  console.error('❌ Failed to initialize Firebase Admin:', err.message);
  process.exit(1);
}

module.exports = admin;
