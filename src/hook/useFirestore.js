// src/hooks/useFirestore.js - Enhanced Firestore React Hooks
import { useState, useEffect, useCallback, useRef } from 'react';
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

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyD8xIhB_DYAl9e1FeS7ILql2YfxSdnbqHU',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'pcc-5fa54.firebaseapp.com',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'ipcc-5fa54',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'ipcc-5fa54.appspot.com',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '481875426357',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:481875426357:web:0ac421ed7e70b95614057c'
};

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Main Firestore hook for real-time data
export const useFirestore = (collectionName, options = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        if (!collectionName) return;

        setLoading(true);
        setError(null);

        try {
            const collectionRef = collection(db, collectionName);
            let firestoreQuery = collectionRef;

            // Build query constraints
            const constraints = [];

            // Add where clauses
            if (options.where) {
                if (Array.isArray(options.where)) {
                    options.where.forEach(w => {
                        constraints.push(where(w.field, w.operator, w.value));
                    });
                } else if (options.where.field) {
                    constraints.push(where(options.where.field, options.where.operator, options.where.value));
                }
            }

            // Add orderBy
            if (options.orderBy) {
                constraints.push(orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
            }

            // Add limit
            if (options.limit) {
                constraints.push(limit(options.limit));
            }

            // Create the query if we have constraints
            if (constraints.length > 0) {
                firestoreQuery = query(collectionRef, ...constraints);
            }

            // Set up real-time listener
            const unsubscribe = onSnapshot(firestoreQuery, 
                (snapshot) => {
                    const documents = [];
                    snapshot.forEach(doc => {
                        documents.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    
                    setData(documents);
                    setLoading(false);
                    setError(null);
                    
                    console.log(`🔥 Firestore real-time update: ${collectionName} (${documents.length} docs)`);
                },
                (error) => {
                    console.error(`❌ Firestore error for ${collectionName}:`, error);
                    setError(error);
                    setLoading(false);
                }
            );

            unsubscribeRef.current = unsubscribe;

        } catch (err) {
            console.error(`❌ Firestore setup error for ${collectionName}:`, err);
            setError(err);
            setLoading(false);
        }

        // Cleanup function
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [collectionName, JSON.stringify(options)]);

    return { data, loading, error, refetch: () => {} };
};

// Hook for sensor data with real-time updates
export const useFirestoreSensorData = (siteId = null, limit = 50) => {
    const options = {
        orderBy: { field: 'timestamp', direction: 'desc' },
        limit: limit
    };

    if (siteId) {
        options.where = { field: 'site_id', operator: '==', value: siteId };
    }

    return useFirestore('sensors_data', options);
};

// Hook for financial data with real-time updates
export const useFirestoreFinancialData = (siteId = null, limit = 30) => {
    const options = {
        orderBy: { field: 'timestamp', direction: 'desc' },
        limit: limit
    };

    if (siteId) {
        options.where = { field: 'site_id', operator: '==', value: siteId };
    }

    return useFirestore('financial_data', options);
};

// Hook for tasks with real-time updates
export const useFirestoreTasks = (siteId = null, isCompleted = null) => {
    const options = {
        orderBy: { field: 'date', direction: 'asc' }
    };

    const whereConditions = [];
    if (siteId) {
        whereConditions.push({ field: 'site_id', operator: '==', value: siteId });
    }
    if (isCompleted !== null) {
        whereConditions.push({ field: 'is_completed', operator: '==', value: isCompleted });
    }

    if (whereConditions.length > 0) {
        options.where = whereConditions;
    }

    return useFirestore('tasks', options);
};

// Hook for sites data
export const useFirestoreSites = (activeOnly = true) => {
    const options = {};
    
    if (activeOnly) {
        options.where = { field: 'active', operator: '==', value: true };
    }

    return useFirestore('sites', options);
};

// Hook for team members
export const useFirestoreTeamMembers = (type = null) => {
    const options = {
        where: { field: 'active', operator: '==', value: true }
    };

    if (type) {
        options.where = [
            { field: 'active', operator: '==', value: true },
            { field: 'type', operator: '==', value: type }
        ];
    }

    return useFirestore('team_members', options);
};

// CRUD operations hook
export const useFirestoreMutations = (collectionName) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addDocument = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const docRef = await addDoc(collection(db, collectionName), {
                ...data,
                created_at: serverTimestamp()
            });
            console.log(`✅ Document added to ${collectionName}: ${docRef.id}`);
            return { id: docRef.id, success: true };
        } catch (err) {
            console.error(`❌ Error adding document to ${collectionName}:`, err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [collectionName]);

    const updateDocument = useCallback(async (docId, data) => {
        setLoading(true);
        setError(null);
        try {
            const docRef = doc(db, collectionName, docId);
            await updateDoc(docRef, {
                ...data,
                updated_at: serverTimestamp()
            });
            console.log(`✅ Document updated in ${collectionName}: ${docId}`);
            return { success: true };
        } catch (err) {
            console.error(`❌ Error updating document in ${collectionName}:`, err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [collectionName]);

    const deleteDocument = useCallback(async (docId) => {
        setLoading(true);
        setError(null);
        try {
            const docRef = doc(db, collectionName, docId);
            await deleteDoc(docRef);
            console.log(`✅ Document deleted from ${collectionName}: ${docId}`);
            return { success: true };
        } catch (err) {
            console.error(`❌ Error deleting document from ${collectionName}:`, err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [collectionName]);

    return {
        addDocument,
        updateDocument,
        deleteDocument,
        loading,
        error
    };
};

// Hook for aggregated dashboard data
export const useFirestoreDashboardData = (siteId = 'site_a_3_acres') => {
    const sensorData = useFirestoreSensorData(siteId, 30);
    const financialData = useFirestoreFinancialData(siteId, 10);
    const tasks = useFirestoreTasks(siteId, false); // Only incomplete tasks
    const sites = useFirestoreSites();

    return {
        sensorData: {
            data: sensorData.data,
            loading: sensorData.loading,
            error: sensorData.error
        },
        financialData: {
            data: financialData.data,
            loading: financialData.loading,
            error: financialData.error
        },
        tasks: {
            data: tasks.data,
            loading: tasks.loading,
            error: tasks.error
        },
        sites: {
            data: sites.data,
            loading: sites.loading,
            error: sites.error
        },
        loading: sensorData.loading || financialData.loading || tasks.loading || sites.loading
    };
};

// Hook for real-time alerts and notifications
export const useFirestoreAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for high-priority tasks (alerts)
        const alertsQuery = query(
            collection(db, 'tasks'),
            where('priority', '==', 'high'),
            where('is_completed', '==', false),
            orderBy('created_at', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
            const alertTasks = [];
            snapshot.forEach(doc => {
                alertTasks.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setAlerts(alertTasks);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { alerts, loading };
};

// Batch operations hook
export const useFirestoreBatch = () => {
    const [loading, setLoading] = useState(false);

    const batchUpdate = useCallback(async (operations) => {
        setLoading(true);
        try {
            // Since we can't use writeBatch in the frontend directly with v9,
            // we'll send batch operations to the backend API
            const response = await fetch('/api/firestore/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ operations })
            });

            if (!response.ok) {
                throw new Error('Batch operation failed');
            }

            const result = await response.json();
            console.log('✅ Batch operation completed:', result);
            return result;
        } catch (error) {
            console.error('❌ Batch operation error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return { batchUpdate, loading };
};

// Export the Firestore database instance for direct use
export { db };
export default useFirestore;