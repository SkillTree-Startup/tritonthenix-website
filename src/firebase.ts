import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from "firebase/analytics"
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyC7KXjTKK2Qm4QLBjZq7XEMhPhatGqXgCQ",
  authDomain: "tritonthenix-5a14f.firebaseapp.com",
  projectId: "tritonthenix-5a14f",
  storageBucket: "tritonthenix-5a14f.firebasestorage.app",
  messagingSenderId: "427440820094",
  appId: "1:427440820094:web:49aefa76ab56607c25ed2f",
  measurementId: "G-XS9PYKRC1F"
}

const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)
export const db = getFirestore(app)
export const storage = getStorage(app) 