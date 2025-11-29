
// This service handles Authentication and Data Storage.
// NOTE: To use real Firebase, uncomment the firebase imports and configuration, 
// and replace the "Simulation" functions with the Firebase equivalents.

/* 
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
*/

import { User, Campaign, Task, Transaction, Platform, TaskType } from "../types";

// --- SIMULATION HELPERS (Uses LocalStorage to mimic Firebase) ---
const STORAGE_KEY_USERS = 'followme_users_db';
const STORAGE_KEY_SESSION = 'followme_session';

interface DB {
    users: Record<string, {
        user: User;
        campaigns: Campaign[];
        transactions: Transaction[];
        tasks: Task[]; // Available tasks for this user
    }>
}

const getDB = (): DB => {
    const data = localStorage.getItem(STORAGE_KEY_USERS);
    return data ? JSON.parse(data) : { users: {} };
};

const saveDB = (db: DB) => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(db));
};

// --- AUTH SERVICES ---

export const loginService = async (email: string, password: string): Promise<{user: User, isNew: boolean}> => {
    // SIMULATION: Check if user exists in local DB
    await new Promise(r => setTimeout(r, 800)); // Fake network delay
    
    const db = getDB();
    const foundId = Object.keys(db.users).find(id => db.users[id].user.email === email);

    if (foundId) {
        // User exists, return data
        localStorage.setItem(STORAGE_KEY_SESSION, foundId);
        return { user: db.users[foundId].user, isNew: false };
    } else {
        throw new Error("User not found. Please Sign Up.");
    }
};

export const signupService = async (email: string, password: string, username: string): Promise<{user: User, isNew: boolean}> => {
    // SIMULATION: Create new user
    await new Promise(r => setTimeout(r, 800));
    
    const db = getDB();
    const exists = Object.keys(db.users).find(id => db.users[id].user.email === email);
    
    if (exists) {
        throw new Error("User already exists. Please Log In.");
    }

    const newUserId = 'u_' + Date.now();
    const newUser: User = {
        id: newUserId,
        username: username,
        email: email,
        credits: 50, // BONUS FOR NEW USERS
        reputation: 100,
        avatarUrl: `https://ui-avatars.com/api/?name=${username}&background=random`,
        streak: 1,
        lastLoginDate: new Date().toISOString(),
        adWatchesToday: 0,
        lastAdDate: new Date().toISOString(),
        country: 'Worldwide',
        language: 'EN'
    };

    // Initialize empty data for new user
    db.users[newUserId] = {
        user: newUser,
        campaigns: [],
        transactions: [{
            id: 'tx_welcome',
            type: 'bonus',
            amount: 50,
            date: new Date().toISOString(),
            description: 'Welcome Bonus 🎉'
        }],
        tasks: [] // In a real app, this would fetch global tasks. We'll handle this in App.tsx
    };

    saveDB(db);
    localStorage.setItem(STORAGE_KEY_SESSION, newUserId);
    
    return { user: newUser, isNew: true };
};

export const logoutService = async () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
};

export const checkSessionService = async (): Promise<string | null> => {
    return localStorage.getItem(STORAGE_KEY_SESSION);
};

// --- DATA SERVICES ---

export const loadUserData = async (userId: string) => {
    const db = getDB();
    return db.users[userId] || null;
};

export const saveUserData = async (
    userId: string, 
    data: { user: User, campaigns: Campaign[], transactions: Transaction[] }
) => {
    const db = getDB();
    if (db.users[userId]) {
        db.users[userId].user = data.user;
        db.users[userId].campaigns = data.campaigns;
        db.users[userId].transactions = data.transactions;
        saveDB(db);
    }
};
