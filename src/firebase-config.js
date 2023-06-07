// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import{getAuth,GoogleAuthProvider}from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4hkqB5l31ZUzjTaCGqzZuH0hDRh2vs38",
  authDomain: "chat-59a0d.firebaseapp.com",
  projectId: "chat-59a0d",
  storageBucket: "chat-59a0d.appspot.com",
  messagingSenderId: "165852204391",
  appId: "1:165852204391:web:d8c186a9a568e0d85033c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
