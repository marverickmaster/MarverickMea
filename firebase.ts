import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAuua8m7g4r7TBVlxnZdnAB07LaiNFEy9U",
  authDomain: "maverick-meals-db.firebaseapp.com",
  projectId: "maverick-meals-db",
  storageBucket: "maverick-meals-db.firebasestorage.app",
  messagingSenderId: "713624660462",
  appId: "1:713624660462:web:3fe870ef34e525bdd206ff",
  measurementId: "G-5PKPCDR5DE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);