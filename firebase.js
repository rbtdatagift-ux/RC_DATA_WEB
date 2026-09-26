import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB4l5SKr8gBrVDTajO8dJQYwxa8jqRdbdA",
  authDomain: "rc-data-one.firebaseapp.com",
  projectId: "rc-data-one",
  storageBucket: "rc-data-one.firebasestorage.app",
  messagingSenderId: "262529305611",
  appId: "1:262529305611:web:0c57656942630830c78b0e",
  measurementId: "G-LJJK2R4M0C"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
};
