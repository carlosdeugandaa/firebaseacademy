// firebase-messaging-sw.js
// This file runs in the background — outside your web page.
// It must be at the ROOT of your site (same folder as index.html).

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDcAa3lAITasot_HHODfNhdnrQbqNQVgUE",
  authDomain: "fir-academy-d950d.firebaseapp.com",
  projectId: "fir-academy-d950d",
  storageBucket: "fir-academy-d950d.firebasestorage.app",
  messagingSenderId: "705122530570",
  appId: "1:705122530570:web:7d1649b142b10ca32fb6f3"
});

const messaging = firebase.messaging();

// Fires when a notification arrives while the tab is CLOSED or in the BACKGROUND
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);

  const title = payload.notification?.title || "Firebase Academy";
  const body  = payload.notification?.body  || "You have a new message";

  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",   // optional — add an icon to your repo if you want
    badge: "/icon-192.png"
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});
