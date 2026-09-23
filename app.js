import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// 🔽 REPLACE THIS WITH YOUR OWN FIREBASE CONFIG 🔽
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDcAa3lAITasot_HHODfNhdnrQbqNQVgUE",
  authDomain: "fir-academy-d950d.firebaseapp.com",
  projectId: "fir-academy-d950d",
  storageBucket: "fir-academy-d950d.firebasestorage.app",
  messagingSenderId: "705122530570",
  appId: "1:705122530570:web:7d1649b142b10ca32fb6f3",
  measurementId: "G-LXER8DHEFE"
};
// 🔼 REPLACE THIS WITH YOUR OWN FIREBASE CONFIG 🔼

const app = initializeApp(firebaseConfig);

document.getElementById("app").innerHTML = `
  <h1>🔥 Firebase Academy</h1>
  <p>Firebase initialized: <strong>${app.name}</strong></p>
  <p>Status: <span style="color: #4ade80;">Ready</span></p>
`;
