/**
 * @module firebase-config
 * @description Initialises Firebase services for CivicLens India.
 *   Exports auth, Firestore, and Analytics instances used by the quiz module.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import {
  getAuth,
  signInAnonymously,
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import {
  getFirestore,
  collection,
  addDoc,
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import {
  getAnalytics,
  logEvent,
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-appcheck.js';

/** @type {import('firebase/app').FirebaseOptions} */
const firebaseConfig = {
  projectId: 'civiclens-faf3d',
  appId: '1:340835039228:web:ec420c7c1a084ce075e479',
  storageBucket: 'civiclens-faf3d.firebasestorage.app',
  apiKey: 'AIzaSyAr_3WHb0DScqA9aAGvxOLlu_v94Sze1q8',
  authDomain: 'civiclens-faf3d.firebaseapp.com',
  messagingSenderId: '340835039228',
  projectNumber: '340835039228',
  version: '2',
};

// Initialize Google Services
const app = initializeApp(firebaseConfig);

// Initialize App Check to protect Firestore writes.
// Note: Requires configuring reCAPTCHA v3 in the Firebase Console.
// Using a placeholder site key until one is provided.
try {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'), // Example/Test key. Replace with real site key.
    isTokenAutoRefreshEnabled: true
  });
} catch (e) {
  console.warn('App Check initialization failed:', e);
}

const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics, logEvent, signInAnonymously, collection, addDoc };
