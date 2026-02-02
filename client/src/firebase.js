// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCkbraCvSchI_EGSvZBXwQkzAZJb3ILPrc",
    authDomain: "e-jansunwai-web-portal.firebaseapp.com",
    projectId: "e-jansunwai-web-portal",
    storageBucket: "e-jansunwai-web-portal.firebasestorage.app",
    messagingSenderId: "517066061733",
    appId: "1:517066061733:web:54fdecc0593e0018891a4c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
