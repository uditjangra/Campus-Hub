"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
  error: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set persistence to LOCAL by default
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.warn("User document not found in Firestore for UID:", user.uid);
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      } catch (err: any) {
        console.error("Error in onAuthStateChanged:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Create new user profile
        const newUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          username: user.email?.split("@")[0] || "user_" + Math.random().toString(36).slice(2, 7),
          createdAt: new Date().toISOString(),
          branch: "",
          year: "",
          bio: "",
          skills: [],
          interests: [],
        };
        await setDoc(docRef, newUser);
        setUserData(newUser);
      } else {
        setUserData(docSnap.data());
      }
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      setError(error.message);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const user = result.user;
      
      const docRef = doc(db, "users", user.uid);
      const newUser = {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: null,
        username: email.split("@")[0],
        createdAt: new Date().toISOString(),
        branch: "",
        year: "",
        bio: "",
        skills: [],
        interests: [],
      };
      await setDoc(docRef, newUser);
      setUserData(newUser);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      logout,
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
