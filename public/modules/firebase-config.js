// public/modules/firebase-config.js

// Import Firebase directly from Google's CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";

// REPLACE THIS with your actual config from Step 1
const firebaseConfig = {
  "projectId": "civiclens-faf3d",
  "appId": "1:340835039228:web:ec420c7c1a084ce075e479",
  "storageBucket": "civiclens-faf3d.firebasestorage.app",
  "apiKey": "AIzaSyAr_3WHb0DScqA9aAGvxOLlu_v94Sze1q8",
  "authDomain": "civiclens-faf3d.firebaseapp.com",
  "messagingSenderId": "340835039228",
  "projectNumber": "340835039228",
  "version": "2"
};

// Initialize Google Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics, logEvent, signInAnonymously, collection, addDoc };