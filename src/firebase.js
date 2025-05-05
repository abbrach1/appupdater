// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC32oHoQYTi4STa7pTRsu7NnjyzMWmnbDg",
  authDomain: "appupdater-afb60.firebaseapp.com",
  projectId: "appupdater-afb60",
  storageBucket: "appupdater-afb60.appspot.com",
  messagingSenderId: "412599866307",
  appId: "1:412599866307:web:ae6e85d60d4038c34e6376",
  measurementId: "G-6TDPQGR5H2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
