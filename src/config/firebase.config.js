// /src/config/firebaseConfig.config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-I2siOPABFiF5X4kEnL5LroET5Wr3quc",
  authDomain: "mini-project-alterra-12ff7.firebaseapp.com",
  projectId: "mini-project-alterra-12ff7",
  storageBucket: "mini-project-alterra-12ff7.firebasestorage.app",
  messagingSenderId: "1047262522965",
  appId: "1:1047262522965:web:bda5d624877217e658eedc",
  measurementId: "G-P92CDK1EEL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
