// ══════════════════════════════════════════════════════════
// FIREBASE CONFIGURATION
// ══════════════════════════════════════════════════════════
// 👇 Apna Firebase config yahan paste karo (Firebase Console → Project Settings → Web App)

const firebaseConfig = {
  apiKey: "AIzaSyB5tKODV6o9EH405hMfMq16d9Pbtu3e_Fk",
  authDomain: "quizforge2026.firebaseapp.com",
  projectId: "quizforge2026",
  storageBucket: "quizforge2026.firebasestorage.app",
  messagingSenderId: "577121555867",
  appId: "1:577121555867:web:bb611a8dc208498dd1bd3e",
  measurementId: "G-EH7BSSB401"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Service references
const auth = firebase.auth();
const db = firebase.firestore();

// Auth providers
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore settings
db.settings({ experimentalForceLongPolling: false });

// Helper: Check if Firebase is configured
function isFirebaseConfigured() {
  return typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.apiKey.length > 20;
}

console.log('🔥 Firebase initialized', isFirebaseConfigured() ? '(LIVE)' : '(PLACEHOLDER — config update karo!)');
