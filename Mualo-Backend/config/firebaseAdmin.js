import admin from 'firebase-admin';
import { createRequire } from 'module';
import { readFileSync } from 'fs';

//CommonJS 'require' function scoped to this file.
const require = createRequire(import.meta.url);

// the custom 'require' to load the JSON file safely, adjusting the path:
// We use '../' to move up one directory level from 'config' to 'Mualo-Backend'.
const serviceAccount = require('../serviceAccountKey.json');

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// 3. Export using ES module syntax
export default admin;