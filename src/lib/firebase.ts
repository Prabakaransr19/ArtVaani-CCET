// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHB55E72BsCVZpMoSYh0VWte5yJGTSl7Q",
  authDomain: "artvaani-pvk4u.firebaseapp.com",
  projectId: "artvaani-pvk4u",
  storageBucket: "artvaani-pvk4u.firebasestorage.app",
  messagingSenderId: "251016332521",
  appId: "1:251016332521:web:3f998552e1d1650ec99c78"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
