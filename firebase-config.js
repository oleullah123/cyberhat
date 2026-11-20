// ============ CYBER HAT — Firebase config ============
// Firebase Console → Project settings → Your apps → Web app থেকে এই মানগুলো কপি করে বসান।
// (এই কী গোপন নয় — আসল নিরাপত্তা firestore.rules দিয়ে হয়।)
export const firebaseConfig = {
  apiKey: "AIzaSyDwYqPaM0nsYuz1TITyzQashruCVtYLwmQ",
  authDomain: "cyberhat-chat.firebaseapp.com",
  projectId: "cyberhat-chat",
  storageBucket: "cyberhat-chat.firebasestorage.app",
  messagingSenderId: "942321463098",
  appId: "1:942321463098:web:231e3e400c1da30769ea03"
};

// অ্যাডমিনের ইমেইল (Firebase Authentication-এ যে ইমেইলে অ্যাডমিন ইউজার বানাবেন)।
// firestore.rules ফাইলেও একই ইমেইল দিতে হবে।
export const ADMIN_EMAIL = "oleullah123@gmail.com";
