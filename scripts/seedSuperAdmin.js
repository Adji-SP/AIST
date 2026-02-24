/**
 * scripts/seedSuperAdmin.js
 *
 * One-time seeder to create a superadmin account in Firebase Auth
 * and write the corresponding record to Firestore users/{uid}.
 *
 * Usage:
 * npm run seed:admin
 *
 * Customize SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD below,
 * or pass them as env vars:
 * ADMIN_EMAIL=you@domain.com ADMIN_PASSWORD=secret npm run seed:admin
 */

require('dotenv').config();
const { initializeApp, getApps, deleteApp } = require('firebase/app');
const {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} = require('firebase/auth');
const {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} = require('firebase/firestore');

// ─── Config ──────────────────────────────────────────────────────────────────
const SUPERADMIN_EMAIL = process.env.ADMIN_EMAIL || 'superadmin@aist.com';
const SUPERADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AIST@SuperAdmin2024!';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// ─── Main ────────────────────────────────────────────────────────────────────
async function seedSuperAdmin() {
    console.log('\n🌱  AIST SuperAdmin Seeder');
    console.log('─────────────────────────────────\n');

    // Validate config
    if (!firebaseConfig.projectId || firebaseConfig.projectId === 'undefined') {
        throw new Error('Firebase config missing. Make sure .env is present with REACT_APP_FIREBASE_* keys.');
    }

    const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    let uid;

    // Step 1: Create Auth user (or confirm it already exists)
    try {
        console.log(`📧  Creating Firebase Auth user: ${SUPERADMIN_EMAIL}`);
        const credential = await createUserWithEmailAndPassword(auth, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD);
        uid = credential.user.uid;
        console.log(`✅  Auth user created  (uid: ${uid})`);
    } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
            console.log('ℹ️   Auth user already exists — signing in to get uid...');
            const credential = await signInWithEmailAndPassword(auth, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD);
            uid = credential.user.uid;
            console.log(`✅  Signed in as existing user  (uid: ${uid})`);
        } else {
            console.error('❌  Failed to create/sign in Auth user:', err.message);
            throw err; // Pass the error to the main catch block
        }
    }

    // Step 2: Write / update Firestore users/{uid}
    try {
        const userRef = doc(db, 'users', uid);
        const existing = await getDoc(userRef);

        if (existing.exists() && existing.data().role === 'superadmin') {
            console.log('ℹ️   Firestore record already has role=superadmin. Nothing to update.');
        } else {
            await setDoc(userRef, {
                uid,
                email: SUPERADMIN_EMAIL,
                displayName: 'Super Admin',
                role: 'superadmin',
                createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
                lastLogin: serverTimestamp(),
            }, { merge: true });
            console.log('✅  Firestore users record written with role=superadmin');
        }
    } catch (err) {
        console.error('❌  Failed to write Firestore record:', err.message);
        throw err; // Pass the error to the main catch block
    }

    console.log('\n🎉  Done!\n');
    console.log('  Email   :', SUPERADMIN_EMAIL);
    console.log('  Password:', SUPERADMIN_PASSWORD);
    console.log('\n  ⚠️  Change the default password after first login!\n');
    
    // Cleanly close Firebase connections before exiting successfully
    await deleteApp(app);
    process.exit(0);
}

// ─── Execute ─────────────────────────────────────────────────────────────────
seedSuperAdmin().catch(async (err) => {
    console.error('\n🚨 Seeding failed.');
    
    // Attempt to cleanly shut down the Firebase app to prevent Node.js assertion crashes
    const apps = getApps();
    if (apps.length > 0) {
        await deleteApp(apps[0]);
    }
    
    process.exit(1);
});