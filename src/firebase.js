import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDMzDXBZ3GNLffrNX4K_qJ5CaGu8komiSE",
    authDomain: "register-user-d00a7.firebaseapp.com",
    projectId: "register-user-d00a7",
    storageBucket: "register-user-d00a7.appspot.com",
    messagingSenderId: "779831180502",
    appId: "1:779831180502:web:7ca24f4c23d2ccce9d1d77"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db=getFirestore()
export const provider = new GoogleAuthProvider();
