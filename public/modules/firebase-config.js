/**
 * @module firebase-config
 * @description Initialises Firebase services for CivicLens India.
 *   Exports auth, Firestore, Analytics, and Performance instances.
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
import { getPerformance } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-performance.js';
import { APP_CONFIG } from './config.js';

/** @type {import('firebase/app').FirebaseOptions} */
const firebaseConfig = {
  projectId: 'civiclens-faf3d',
  appId: '1:340835039228:web:ec420c7c1a084ce075e479',
  storageBucket: 'civiclens-faf3d.firebasestorage.app',
  apiKey: 'AIzaSyAr_3WHb0DScqA9aAGvxOLlu_v94Sze1q8',
  authDomain: 'civiclens-faf3d.firebaseapp.com',
  messagingSenderId: '340835039228',
  // GA4 Measurement ID — update APP_CONFIG.FIREBASE.MEASUREMENT_ID in config.js
  measurementId: APP_CONFIG.FIREBASE.MEASUREMENT_ID,
};

// Initialize core Firebase app
const app = initializeApp(firebaseConfig);

// Initialize App Check — protects Firestore write path from unauthorized clients.
// To enforce in production: replace RECAPTCHA_SITE_KEY in config.js with a real key
// and click Enforce in Firebase Console → App Check → Apps.
const recaptchaKey = APP_CONFIG.FIREBASE.RECAPTCHA_SITE_KEY;
if (recaptchaKey === '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI') {
  console.warn(
    '[CivicLens] App Check is using the Google test reCAPTCHA key. ' +
    'Replace APP_CONFIG.FIREBASE.RECAPTCHA_SITE_KEY in config.js with a ' +
    'production key to enforce App Check. See SECURITY.md for steps.'
  );
}
try {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaKey),
    isTokenAutoRefreshEnabled: true,
  });
} catch (e) {
  console.warn('[CivicLens] App Check initialization failed:', e);
}

const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
// Firebase Performance Monitoring — measures real-user page load and custom traces
const perf = getPerformance(app);

export { auth, db, analytics, perf, logEvent, signInAnonymously, collection, addDoc };
