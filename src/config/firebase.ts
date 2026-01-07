import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// ---- Firebase Admin Initialization (MINIMAL) ----

let appInitialized = false;

export function getFirebaseApp() {
  if (!appInitialized) {
    try {
      // Try to load service account from environment or file
      const serviceAccount = require('./service-account.json');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.GCP_PROJECT_ID,
      });
    } catch (error) {
      // Fallback: use default credentials from environment
      admin.initializeApp({
        projectId: process.env.GCP_PROJECT_ID,
      });
    }
    
    appInitialized = true;
    console.log('✅ Firebase Admin initialized');
  }

  return admin.app();
}

// Initialize on import
getFirebaseApp();

export default getFirebaseApp;
