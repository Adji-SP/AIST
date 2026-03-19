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
    deleteDoc,
    addDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs,
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
    const [userDevices, setUserDevices] = useState([]);
    const [userDevicesData, setUserDevicesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch role from Firestore users/{uid} with a 5-second timeout to prevent infinite hang if blocked
                try {
                    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 5000));

                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await Promise.race([getDoc(userDocRef), timeout]);
                    const userData = userDoc.exists() ? userDoc.data() : {};
                    setRole(userData.role || 'user');

                    // Fetch associated devices (full objects + ID list)
                    const devicesRef = collection(db, 'devices');
                    const q = query(devicesRef, where('assigned_to_uid', '==', firebaseUser.uid));
                    const devicesSnap = await Promise.race([getDocs(q), timeout]);

                    const fullDevices = devicesSnap.docs.map(d => ({ docId: d.id, ...d.data() }));
                    setUserDevicesData(fullDevices);

                    // Safely extract device IDs, remove falsy values, and strictly limit to 10 for Firestore 'in' queries
                    let devices = fullDevices.map(d => d.device_id).filter(id => id);
                    if (devices.length === 0) devices = ['UNASSIGNED_FALLBACK'];
                    if (devices.length > 10) devices = devices.slice(0, 10);

                    setUserDevices(devices);
                } catch {
                    setRole('user');
                    setUserDevices([]);
                    setUserDevicesData([]);
                }
                setUser(firebaseUser);
            } else {
                setUser(null);
                setRole(null);
                setUserDevices([]);
                setUserDevicesData([]);
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

    // ─── Device Mutation Helpers ───────────────────────────────────────────────
    const refreshDevices = async (uid) => {
        try {
            const devicesRef = collection(db, 'devices');
            const q = query(devicesRef, where('assigned_to_uid', '==', uid));
            const devicesSnap = await getDocs(q);
            const fullDevices = devicesSnap.docs.map(d => ({ docId: d.id, ...d.data() }));
            setUserDevicesData(fullDevices);
            let ids = fullDevices.map(d => d.device_id).filter(Boolean);
            if (ids.length === 0) ids = ['UNASSIGNED_FALLBACK'];
            if (ids.length > 10) ids = ids.slice(0, 10);
            setUserDevices(ids);
            return fullDevices;
        } catch (err) {
            console.error('Error refreshing devices:', err);
            return userDevicesData;
        }
    };

    const addDevice = async (deviceData) => {
        if (!user) throw new Error('Must be logged in to add a device');
        const payload = {
            device_id: deviceData.device_id,
            name: deviceData.name || `Device ${deviceData.device_id}`,
            orchard: deviceData.orchard || '',
            status: 'active',
            assigned_to_uid: user.uid,
            assigned_to_email: user.email,
            registered_at: serverTimestamp(),
            last_seen: null,
        };
        const docRef = await addDoc(collection(db, 'devices'), payload);
        await refreshDevices(user.uid);
        return { docId: docRef.id, ...payload };
    };

    const removeDevice = async (docId) => {
        if (!user) throw new Error('Must be logged in to remove a device');
        await deleteDoc(doc(db, 'devices', docId));
        await refreshDevices(user.uid);
    };

    return (
        <AuthContext.Provider value={{
            user, role, userDevices, userDevicesData, loading,
            login, register, logout,
            addDevice, removeDevice, refreshDevices,
            db, auth
        }}>
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
