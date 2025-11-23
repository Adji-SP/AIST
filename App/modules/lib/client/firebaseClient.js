// App/modules/lib/client/firebaseClient.js
// Shared Firebase client library - Works in both Node.js and Browser
// This is the SINGLE source of truth for Firebase operations

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';

/**
 * Firebase Client - Clean abstraction for Firebase operations
 * Can be used in both React (browser) and Node.js environments
 */
class FirebaseClient {
    constructor(config) {
        this.config = config;
        this.app = null;
        this.db = null;
        this.listeners = new Map();
    }

    /**
     * Initialize Firebase app and Firestore
     */
    initialize() {
        if (!this.app) {
            this.app = initializeApp(this.config);
            this.db = getFirestore(this.app);
        }
        return this;
    }

    /**
     * Get Firestore database instance
     */
    getDatabase() {
        if (!this.db) {
            throw new Error('Firebase not initialized. Call initialize() first.');
        }
        return this.db;
    }

    /**
     * Subscribe to real-time updates for a collection
     * @param {string} collectionName - Collection to subscribe to
     * @param {object} options - Query options (where, orderBy, limit)
     * @param {function} callback - Callback function for updates
     * @returns {function} Unsubscribe function
     */
    subscribe(collectionName, options = {}, callback) {
        const collectionRef = collection(this.db, collectionName);
        const constraints = this._buildQueryConstraints(options);

        const firestoreQuery = constraints.length > 0
            ? query(collectionRef, ...constraints)
            : collectionRef;

        const unsubscribe = onSnapshot(
            firestoreQuery,
            (snapshot) => {
                const documents = [];
                snapshot.forEach(doc => {
                    documents.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(documents, null);
            },
            (error) => {
                callback(null, error);
            }
        );

        // Store listener for cleanup
        const listenerId = `${collectionName}_${Date.now()}`;
        this.listeners.set(listenerId, unsubscribe);

        return () => {
            unsubscribe();
            this.listeners.delete(listenerId);
        };
    }

    /**
     * Get documents once (no real-time)
     */
    async get(collectionName, options = {}) {
        const collectionRef = collection(this.db, collectionName);
        const constraints = this._buildQueryConstraints(options);

        const firestoreQuery = constraints.length > 0
            ? query(collectionRef, ...constraints)
            : collectionRef;

        const snapshot = await getDocs(firestoreQuery);
        const documents = [];
        snapshot.forEach(doc => {
            documents.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return documents;
    }

    /**
     * Add a document to a collection
     */
    async add(collectionName, data) {
        const collectionRef = collection(this.db, collectionName);
        const docRef = await addDoc(collectionRef, {
            ...data,
            created_at: serverTimestamp()
        });
        return { id: docRef.id, success: true };
    }

    /**
     * Update a document
     */
    async update(collectionName, docId, data) {
        const docRef = doc(this.db, collectionName, docId);
        await updateDoc(docRef, {
            ...data,
            updated_at: serverTimestamp()
        });
        return { success: true };
    }

    /**
     * Delete a document
     */
    async delete(collectionName, docId) {
        const docRef = doc(this.db, collectionName, docId);
        await deleteDoc(docRef);
        return { success: true };
    }

    /**
     * Build query constraints from options
     * @private
     */
    _buildQueryConstraints(options) {
        const constraints = [];

        // Where clauses
        if (options.where) {
            if (Array.isArray(options.where)) {
                options.where.forEach(w => {
                    constraints.push(where(w.field, w.operator, w.value));
                });
            } else if (options.where.field) {
                constraints.push(where(options.where.field, options.where.operator, options.where.value));
            }
        }

        // Order by
        if (options.orderBy) {
            constraints.push(orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
        }

        // Limit
        if (options.limit) {
            constraints.push(limit(options.limit));
        }

        return constraints;
    }

    /**
     * Clean up all listeners
     */
    cleanup() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners.clear();
    }
}

// Singleton instance
let firebaseClientInstance = null;

/**
 * Get or create Firebase client instance
 */
export function getFirebaseClient(config = null) {
    if (!firebaseClientInstance) {
        if (!config) {
            // Try to get config from environment
            config = {
                apiKey: process.env.REACT_APP_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
                authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
                projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.REACT_APP_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID
            };
        }
        firebaseClientInstance = new FirebaseClient(config);
        firebaseClientInstance.initialize();
    }
    return firebaseClientInstance;
}

export default FirebaseClient;
