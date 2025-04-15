import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCL-y1VserUCDqL3plKcXwDe0E7-_dH43o",
  authDomain: "sw-customer-tracker.firebaseapp.com",
  projectId: "sw-customer-tracker",
  storageBucket: "sw-customer-tracker.appspot.com",
  messagingSenderId: "665099220770",
  appId: "1:665099220770:web:e8d7a04cce7e2a2d65d77b",
  measurementId: "G-KJDNWXT8EC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sign Up
function signup() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("User signed up!"))
    .catch((error) => alert(error.message));
}

// Login
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  signInWithEmailAndPassword(auth, email, password)
    .catch((error) => alert(error.message));
}

// Logout
function logout() {
  signOut(auth).then(() => alert("Logged out"));
}

// Auth State Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
    document.getElementById("userEmail").textContent = user.email;
  } else {
    document.getElementById("authSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
  }
});

// Make functions global
window.signup = signup;
window.login = login;
window.logout = logout;
