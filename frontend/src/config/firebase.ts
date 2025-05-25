import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCbGS9lFnFK7_98qxACHDfvsEDKgTJlwP0",
  authDomain: "login-app-ventas-turisticas.firebaseapp.com",
  projectId: "login-app-ventas-turisticas",
  storageBucket: "login-app-ventas-turisticas.appspot.com",
  messagingSenderId: "294562557196",
  appId: "1:294562557196:web:fd3f9046c67c3005982d29",
  measurementId: "G-2KECSCS65X"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);