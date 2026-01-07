import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

// ---- Firebase Admin Initialization (PRODUCTION-READY) ----

let appInitialized = false;

export function getFirebaseApp() {
  if (!appInitialized) {
    try {
      // In Cloud Run, use Application Default Credentials (ADC)
      // No need to load service-account.json - GCP handles this automatically
      
      // Check if running on Cloud Run or has explicit service account
      const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
      
      if (!projectId) {
        console.warn('⚠️  GCP_PROJECT_ID not set. Firebase may not work correctly.');
      }
      
      admin.initializeApp({
        projectId: projectId,
        // On Cloud Run, credential is automatically detected from environment
        // No need to explicitly set credential property
      });
      
      console.log('✅ Firebase Admin initialized successfully');
      console.log(`   Project ID: ${projectId}`);
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      console.error('This is expected if running locally without credentials.');
      console.error('On Cloud Run, credentials are automatically provided.');
    }
    
    appInitialized = true;
  }

  return admin.app();
}

// Initialize on import
getFirebaseApp();

export default getFirebaseApp;
