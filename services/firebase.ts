
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


import { supabase } from './supabase';
import { User, Campaign, Task, Transaction } from '../types';

// --- AUTH SERVICES ---

export const loginService = async (email: string, password: string): Promise<{ user: User, isNew: boolean }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
        throw new Error(error?.message || 'Login failed.');
    }
    // Fetch user profile from 'users' table
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
    if (userError || !userData) {
        throw new Error(userError?.message || 'User profile not found.');
    }
    return { user: userData as User, isNew: false };
};

export const signupService = async (email: string, password: string, username: string): Promise<{ user: User, isNew: boolean }> => {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
        throw new Error(error?.message || 'Signup failed.');
    }
    // Create user profile in 'users' table
    const newUser: User = {
        id: data.user.id,
        username,
        email,
        credits: 50,
        reputation: 100,
        avatarUrl: `https://ui-avatars.com/api/?name=${username}&background=random`,
        streak: 1,
        lastLoginDate: new Date().toISOString(),
        adWatchesToday: 0,
        lastAdDate: new Date().toISOString(),
        country: 'Worldwide',
        language: 'EN'
    };
    const { error: insertError } = await supabase.from('users').insert([newUser]);
    if (insertError) {
        throw new Error(insertError.message);
    }
    // Add welcome transaction
    await supabase.from('transactions').insert([
        {
            id: 'tx_welcome_' + newUser.id,
            type: 'bonus',
            amount: 50,
            date: new Date().toISOString(),
            description: 'Welcome Bonus 🎉',
            user_id: newUser.id
        }
    ]);
    return { user: newUser, isNew: true };
};

export const logoutService = async () => {
    await supabase.auth.signOut();
};

export const checkSessionService = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id || null;
};

// --- DATA SERVICES ---

export const loadUserData = async (userId: string) => {
    // Fetch user profile, campaigns, transactions, and tasks
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    if (userError || !user) return null;

    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userId);

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);

    return {
        user,
        campaigns: campaigns || [],
        transactions: transactions || [],
        tasks: tasks || []
    };
};

export const saveUserData = async (
    userId: string,
    data: { user: User, campaigns: Campaign[], transactions: Transaction[] }
) => {
    // Update user profile
    await supabase.from('users').update(data.user).eq('id', userId);
    // Update campaigns
    if (data.campaigns.length > 0) {
        for (const campaign of data.campaigns) {
            await supabase.from('campaigns').upsert({ ...campaign, user_id: userId });
        }
    }
    // Update transactions
    if (data.transactions.length > 0) {
        for (const tx of data.transactions) {
            await supabase.from('transactions').upsert({ ...tx, user_id: userId });
        }
    }
};
