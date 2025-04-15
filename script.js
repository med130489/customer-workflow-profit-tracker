import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCL-y1VserUCDqL3plKcXwDe0E7-_dH43o",
  authDomain: "sw-customer-tracker.firebaseapp.com",
  projectId: "sw-customer-tracker",
  storageBucket: "sw-customer-tracker.firebasestorage.app",
  messagingSenderId: "665099220770",
  appId: "1:665099220770:web:e8d7a04cce7e2a2d65d77b",
  measurementId: "G-KJDNWXT8EC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const roleInput = document.getElementById("role");

const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const userEmail = document.getElementById("userEmail");

async function signup() {
  const email = emailInput.value;
  const password = passwordInput.value;
  const role = roleInput.value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), { email, role });
    alert("Sign up successful!");
  } catch (error) {
    alert(error.message);
  }
}

async function login() {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
  } catch (error) {
    alert(error.message);
  }
}

async function logout() {
  await signOut(auth);
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.style.display = "none";
    appSection.style.display = "block";
    userEmail.textContent = user.email;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();
    console.log("Logged in as:", userData.role);
  } else {
    authSection.style.display = "block";
    appSection.style.display = "none";
  }
});
