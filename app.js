// app.js
import { app, auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();
const appDiv = document.getElementById("app");

// ---------- HELPERS ----------

function showError(msg) {
  const el = document.getElementById("error");
  if (el) el.textContent = msg;
  else alert(msg);
}

// Save or update the user's profile document
async function ensureUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp()
    });
    console.log("Profile created for", user.uid);
  }
}

// ---------- UI ----------

function renderLoggedOut() {
  appDiv.innerHTML = `
    <h1>🔥 Firebase Academy</h1>
    <p class="muted">Please sign in or create an account</p>
    <div class="card">
      <input id="email" type="email" placeholder="Email" />
      <input id="password" type="password" placeholder="Password" />
      <button id="signupBtn">Sign Up</button>
      <button id="loginBtn">Log In</button>
      <button id="googleBtn" class="google">Continue with Google</button>
      <p id="error" class="error"></p>
    </div>
  `;
  document.getElementById("signupBtn").onclick = handleSignUp;
  document.getElementById("loginBtn").onclick = handleLogin;
  document.getElementById("googleBtn").onclick = handleGoogle;
}

function renderLoggedIn(user) {
  appDiv.innerHTML = `
    <h1>🔥 Firebase Academy</h1>
    <div class="card">
      <p>Welcome, <strong id="welcomeName">…</strong></p>
      <p class="muted">UID: ${user.uid}</p>
      <button id="logoutBtn" class="danger">Log Out</button>
    </div>
    <div class="card">
      <h3>📚 Lessons</h3>
      <ul id="lessonList"><li class="muted">Loading…</li></ul>
    </div>
  `;
  document.getElementById("logoutBtn").onclick = () => signOut(auth);

  // Fill in the display name from Firestore
  loadProfile(user.uid);

  // Live lessons list
  watchLessons();
}

async function loadProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const nameEl = document.getElementById("welcomeName");
  if (snap.exists() && nameEl) {
    nameEl.textContent = snap.data().displayName;
  }
}

function watchLessons() {
  const listEl = document.getElementById("lessonList");
  if (!listEl) return;

  const col = collection(db, "lessons");
  onSnapshot(col, (snapshot) => {
    if (snapshot.empty) {
      listEl.innerHTML = `<li class="muted">No lessons yet. Add some in Firebase Console!</li>`;
      return;
    }
    listEl.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const li = document.createElement("li");
      li.textContent = data.title || "(untitled)";
      listEl.appendChild(li);
    });
  });
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      await ensureUserProfile(user);
    } catch (err) {
      console.error("Profile error:", err);
    }
    renderLoggedIn(user);
  } else {
    renderLoggedOut();
  }
});

console.log("Firebase app:", app.name);
