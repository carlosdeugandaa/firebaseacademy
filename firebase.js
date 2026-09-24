import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getMessaging, isSupported } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";
// add these imports at the top
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-check.js";


const firebaseConfig = {
  apiKey: "AIzaSyDcAa3lAITasot_HHODfNhdnrQbqNQVgUE",
  authDomain: "fir-academy-d950d.firebaseapp.com",
  projectId: "fir-academy-d950d",
  storageBucket: "fir-academy-d950d.firebasestorage.app",
  messagingSenderId: "705122530570",
  appId: "1:705122530570:web:7d1649b142b10ca32fb6f3",
  measurementId: "G-LXER8DHEFE"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// VAPID key — paste yours here
export const VAPID_KEY = "BFmyUmwgr0ylXTgJt8YkdAkovnPCFkFtrhpkRJZSe2CG9IgxuMYq0MqJZkxaE44YwmFgVJwAkn4NjIHDXqIzIKc";

// Messaging is only available in some browsers
export let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
    console.log("✅ FCM supported");
  } else {
    console.warn("❌ FCM not supported in this browser");
  }
});

// add this AFTER export const app = initializeApp(firebaseConfig);
export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LfnGcwtAAAAAIXMu1jG8cMfjNMrruSCIdJ7GA4p"),
  isTokenAutoRefreshEnabled: true
});
