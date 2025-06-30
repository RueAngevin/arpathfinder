// firebaseConfig.ts

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA5SxBLGPzMHd-Q2xkpYFTkDNf89m05PTk",
  authDomain: "arpathfinder-8e409.firebaseapp.com",
  projectId: "arpathfinder-8e409",
  storageBucket: "arpathfinder-8e409.appspot.com",
  messagingSenderId: "1005011348081",
  appId: "1:1005011348081:web:a4ad10e40cb267ff3b89d0",
  // measurementId is optional and only for web analytics, so we leave it out
  databaseURL: "https://arpathfinder-8e409-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
