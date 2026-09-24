import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
