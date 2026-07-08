/**
 * 🔐 Configuration Module
 * Loads environment variables securely
 * Never expose sensitive keys in client-side code
 */

const CONFIG = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  },
  env: import.meta.env.VITE_ENV || 'development',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

// Validate Firebase config
function validateFirebaseConfig() {
  const required = ['apiKey', 'authDomain', 'projectId'];
  const missing = required.filter(key => !CONFIG.firebase[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing Firebase configuration: ${missing.join(', ')}`);
    console.warn('Please set environment variables in .env file');
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', validateFirebaseConfig);
} else {
  validateFirebaseConfig();
}

export default CONFIG;
