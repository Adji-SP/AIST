import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { Navigate } from 'react-router-dom';

// ─── Firebase init (re-use existing app if already initialized) ───────────────
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const firebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch role from Firestore users/{uid}
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    const userData = userDoc.exists() ? userDoc.data() : {};
                    setRole(userData.role || 'user');
                } catch {
                    setRole('user');
                }
                setUser(firebaseUser);
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Sign in + upsert user record so superadmin can see all logins
    const login = async (email, password) => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const { uid, displayName, photoURL } = credential.user;

        const userDocRef = doc(db, 'users', uid);
        const existing = await getDoc(userDocRef);

        await setDoc(userDocRef, {
            uid,
            email,
            displayName: displayName || email.split('@')[0],
            photoURL: photoURL || null,
            role: existing.exists() ? (existing.data().role || 'user') : 'user',
            lastLogin: serverTimestamp(),
            ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
        }, { merge: true });

        return credential;
    };

    // Register a new user
    const register = async (email, password, displayName) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const { uid } = credential.user;

        await setDoc(doc(db, 'users', uid), {
            uid,
            email,
            displayName: displayName || email.split('@')[0],
            photoURL: null,
            role: 'user',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
        });

        return credential;
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, login, register, logout, db, auth }}>
            {children}
        </AuthContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};

// ─── Protected Route ─────────────────────────────────────────────────────────
export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Authenticating...</span>
                </div>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
};

// ─── Admin Route ─────────────────────────────────────────────────────────────
export const AdminRoute = ({ children }) => {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Authenticating Admin...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role !== 'admin') {
        return <Navigate to="/overview" replace />;
    }

    return children;
};

export { auth, db };
export default AuthContext;
