// firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD6Kk8aTn2mRy1nL4M9oOfV96veO-mkccA",
  authDomain: "appelmalade-a7b8a.firebaseapp.com",
  projectId: "appelmalade-a7b8a",
  storageBucket: "appelmalade-a7b8a.appspot.com",
  messagingSenderId: "813491432061",
  appId: "1:813491432061:web:d8b1d0388c795396355f14",
  measurementId: "G-48J269F8ZJ"
};

const app = initializeApp(firebaseConfig);

// Auth avec persistance
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Database
export const database = getDatabase(app);
