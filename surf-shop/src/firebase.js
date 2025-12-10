import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// We removed 'getStorage' since you are using Unsplash URLs

// PASTE YOUR CONFIG OBJECT HERE FROM THE FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyCt64cva4qMa-M0pDDs02th7vZH_5ODBJc",
  authDomain: "surf-shop-webapp.firebaseapp.com",
  projectId: "surf-shop-webapp",
  storageBucket: "surf-shop-webapp.firebasestorage.app",
  messagingSenderId: "96020675744",
  appId: "1:96020675744:web:b4a2dfc84e5bf401331dc5"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export only the services we are actually using
export const auth = getAuth(app);
export const db = getFirestore(app);