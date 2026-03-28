// js/firebase.js  — corrected

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,   // <-- correct name here (lowercase)
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  collectionGroup,
  orderBy,
  limit,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlmO5KEJRYXuU85y_bStfYhigl_75oz7o",
  authDomain: "roo7z-4a109.firebaseapp.com",
  projectId: "roo7z-4a109",
  storageBucket: "roo7z-4a109.firebasestorage.app",
  messagingSenderId: "438129718187",
  appId: "1:438129718187:web:93e9117f09a56511d598ee",
  measurementId: "G-686M4WGGHB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  app,
  auth,
  db,
  storage,
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  collectionGroup,
  orderBy,
  limit,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
  sendPasswordResetEmail,
  ref,
  uploadBytes,
  getDownloadURL
};

