// firebase.js
import firebase from 'firebase/app';
import 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from '@firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAGJwe0U-7JKHtkXWNHghvxS6xRXbwsBIg",
  authDomain: "foodapp-426008.firebaseapp.com",
  projectId: "foodapp-426008",
  storageBucket: "foodapp-426008.appspot.com",
  messagingSenderId: "1017115057952",
  appId: "1:1017115057952:web:c973e1a3dbdd0c290c8145",
  measurementId: "G-0Z1W6LNRDP"
};



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
export { auth, firestore, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword };
