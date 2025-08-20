// firebase.js
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD6Kk8aTn2mRy1nL4M9oOfV96veO-mkccA",
  authDomain: "appelmalade-a7b8a.firebaseapp.com",
  databaseURL: "https://appelmalade-a7b8a-default-rtdb.firebaseio.com",
  projectId: "appelmalade-a7b8a",
  storageBucket: "appelmalade-a7b8a.appspot.com",
  messagingSenderId: "813491432061",
  appId: "1:813491432061:web:d8b1d0388c795396355f14",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const database = getDatabase(app);

export { app, auth, database };
