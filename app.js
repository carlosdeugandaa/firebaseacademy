// app.js
import { app, auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const googleProvider = new GoogleAuthProvider();

const appDiv = document.getElementById("app");

// ---------- RENDER HELPERS ----------

function renderLoggedOut() {
  appDiv.innerHTML = `
    <h1>🔥 Firebase Academy</h1>
    <p class="muted">Please sign in or create an account</p>

    <div class="card">
      <input id="email" type="email" placeholder="Email" autocomplete="email" />
      <input id="password" type="password" placeholder="Password" autocomplete="current-password" />

      <button id="signupBtn">Sign Up</button>
      <button id="loginBtn">Log In</button>
      <button id="googleBtn" class="google">Continue with Google</button>

      <p id="error" class="error"></p>
    </div>
  `;

  document.getElementById("signupBtn").onclick = () => handleSignUp();
  document.getElementById("loginBtn").onclick = () => handleLogin();
  document.getElementById("googleBtn").onclick = () => handleGoogle();
}

function renderLoggedIn(user) {
  appDiv.innerHTML = `
    <h1>🔥 Firebase Academy</h1>
    <div class="card">
      <p>Welcome, <strong>${user.email}</strong></p>
      <p class="muted">UID: ${user.uid}</p>
      <p class="muted">Status: <span class="ok">Authenticated</span></p>
      <button id="logoutBtn" class="danger">Log Out</button>
    </div>
  `;

  document.getElementById("logoutBtn").onclick = async () => {
    await signOut(auth);
  };
}

function showError(msg) {
  const el = document.getElementById("error");
  if (el) el.textContent = msg;
}

// ---------- AUTH ACTIONS ----------

async function handleSignUp() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    showError(err.message);
  }
}

async function handleLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    showError(err.message);
  }
}

async function handleGoogle() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    showError(err.message);
  }
}

// ---------- AUTH STATE OBSERVER ----------

onAuthStateChanged(auth, (user) => {
  if (user) {
    renderLoggedIn(user);
  } else {
    renderLoggedOut();
  }
});

console.log("Firebase app:", app.name);
