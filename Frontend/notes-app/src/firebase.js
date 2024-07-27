// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXBW2iwZ7EIc8MigQYcscLQMm_LztbVC8",
  authDomain: "notes-556d7.firebaseapp.com",
  projectId: "notes-556d7",
  storageBucket: "notes-556d7.appspot.com",
  messagingSenderId: "1020553489058",
  appId: "1:1020553489058:web:0b7c3a0a079253049445fb",
  measurementId: "G-QZ4PL81S71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);