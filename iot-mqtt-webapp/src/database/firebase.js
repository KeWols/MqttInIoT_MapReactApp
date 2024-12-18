// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "API_KEY2",
  authDomain: "mqtt-projekt.firebaseapp.com",
  projectId: "mqtt-projekt",
  storageBucket: "mqtt-projekt.firebasestorage.app",
  messagingSenderId: "71842218211",
  appId: "1:71842218211:web:7a261ec5d342770f0d45d6",
  measurementId: "G-Q6W3V36FWD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Közvetlenül exportáljuk a db-t
export default db;
