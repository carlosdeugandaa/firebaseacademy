import { app, auth, db, analytics, messaging, VAPID_KEY } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, onSnapshot, arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  logEvent, setUserId, setUserProperties
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import {
  getToken, onMessage
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

const googleProvider = new GoogleAuthProvider();
const appDiv = document.getElementById("app");

function track(name, params = {}) {
  try {
    logEvent(analytics, name, params);
    console.log("📊 Event:", name, params);
  } catch (err) {
    console.warn("Analytics error:", err);
  }
}

function showError(msg) {
  const el = document.getElementById("error");
  if (el) el.textContent = msg;
  else alert(msg);
}

// ---------- USER PROFILE ----------
async function ensureUserProfile(user) {
  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: user.email,
        displayName: user.displayName || user.email.split("@")[0],
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        fcmTokens: []          // 👈 list of device tokens
      });
    }
  } catch (err) {
    alert("Profile error: " + err.message);
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
      <button id="notifyBtn">🔔 Enable Notifications</button>
      <p id="notifyStatus" class="muted"></p>
      <button id="logoutBtn" class="danger">Log Out</button>
    </div>
    <div class="card">
      <h3>📚 Lessons</h3>
      <ul id="lessonList"><li class="muted">Loading…</li></ul>
    </div>
  `;

  document.getElementById("logoutBtn").onclick = async () => {
    track("logout");
    setUserId(analytics, null);
    await signOut(auth);
  };
  document.getElementById("notifyBtn").onclick = () => enableNotifications(user);

  loadProfile(user.uid);
  watchLessons();
  listenForegroundMessages();
}

async function loadProfile(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return;
    const nameEl = document.getElementById("welcomeName");
    if (nameEl) nameEl.textContent = snap.data().displayName || "user";
  } catch (err) {
    console.error(err);
  }
}

function watchLessons() {
  const listEl = document.getElementById("lessonList");
  if (!listEl) return;

  onSnapshot(collection(db, "lessons"), (snapshot) => {
    if (snapshot.empty) {
      listEl.innerHTML = `<li class="muted">No lessons yet.</li>`;
      return;
    }
    listEl.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const li = document.createElement("li");
      li.textContent = data.title || "(untitled)";
      li.style.cursor = "pointer";
      li.onclick = () => {
        track("lesson_view", {
          lesson_id: docSnap.id,
          lesson_title: data.title || "(untitled)"
        });
        alert("📊 Logged: opened '" + (data.title || "lesson") + "'");
      };
      listEl.appendChild(li);
    });
  }, (err) => console.error("Lessons error:", err));
}

// ---------- FCM: ENABLE NOTIFICATIONS ----------
async function enableNotifications(user) {
  const statusEl = document.getElementById("notifyStatus");
  if (statusEl) statusEl.textContent = "Requesting permission…";

  if (!("Notification" in window)) {
    showError("This browser doesn't support notifications.");
    return;
  }

  if (!messaging) {
    showError("FCM not supported yet. Try again in a moment.");
    return;
  }

  try {
    // 1) Ask the user for permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      if (statusEl) statusEl.textContent = "❌ Permission denied.";
      track("notification_permission", { granted: false });
      return;
    }

    // 2) Get the FCM registration token
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) {
      if (statusEl) statusEl.textContent = "❌ Could not get token.";
      return;
    }

    console.log("🎫 FCM token:", token);
    if (statusEl) statusEl.textContent = "✅ Notifications enabled!";

    // 3) Save token to Firestore
    await updateDoc(doc(db, "users", user.uid), {
      fcmTokens: arrayUnion(token)
    });

    track("notification_permission", { granted: true });
  } catch (err) {
    console.error(err);
    if (statusEl) statusEl.textContent = "";
    showError("Notification error: " + err.message);
    track("notification_error", { error: err.code || "unknown" });
  }
}

// ---------- FCM: FOREGROUND MESSAGES ----------
function listenForegroundMessages() {
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground message:", payload);

    const title = payload.notification?.title || "Firebase Academy";
    const body  = payload.notification?.body  || "New message";

    // Show an in-page notification (since OS notifications may be hidden
    // when the tab is active)
    const box = document.createElement("div");
    box.style.cssText = `
      position: fixed; top: 20px; left: 20px; right: 20px;
      background: #4ade80; color: #000; padding: 14px;
      border-radius: 10px; font-weight: 600; z-index: 9999;
      box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    `;
    box.innerHTML = `🔔 <strong>${title}</strong><br><span style="font-weight:400;">${body}</span>`;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 6000);
  });
}

// ---------- AUTH ACTIONS ----------
async function handleSignUp() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    track("sign_up", { method: "email" });
  } catch (err) {
    showError(err.message);
    track("sign_up_error", { error: err.code || "unknown" });
  }
}

async function handleLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    track("login", { method: "email" });
  } catch (err) {
    showError(err.message);
    track("login_error", { error: err.code || "unknown" });
  }
}

async function handleGoogle() {
  try {
    await signInWithPopup(auth, googleProvider);
    track("login", { method: "google" });
  } catch (err) {
    showError(err.message);
  }
}

// ---------- AUTH STATE ----------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    setUserId(analytics, user.uid);
    setUserProperties(analytics, {
      email_domain: user.email.split("@")[1] || "unknown",
      provider: user.providerData[0]?.providerId || "unknown"
    });
    await ensureUserProfile(user);
    renderLoggedIn(user);
  } else {
    renderLoggedOut();
  }
});
