// src/hook/useFirestoreClean.js
// CLEAN React hooks - Just handles React state, uses shared library for logic
import { useState, useEffect, useCallback } from 'react';
import { getFirebaseClient } from '../../App/modules/lib/client/firebaseClient';

/**
 * Clean Firestore hook - Real-time subscription to a collection
 * All Firebase logic is in the shared library
 */
export const useFirestore = (collectionName, options = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!collectionName) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const firebaseClient = getFirebaseClient();

        // Subscribe to real-time updates
        const unsubscribe = firebaseClient.subscribe(
            collectionName,
            options,
            (documents, err) => {
                if (err) {
                    setError(err);
                    setLoading(false);
                } else {
                    setData(documents);
                    setLoading(false);
                    setError(null);
                }
            }
        );

        // Cleanup subscription on unmount
        return unsubscribe;
    }, [collectionName, JSON.stringify(options)]);

    return { data, loading, error };
};

/**
 * Firestore mutations hook - CRUD operations
 */
export const useFirestoreMutations = (collectionName) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const firebaseClient = getFirebaseClient();

    const add = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await firebaseClient.add(collectionName, data);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [collectionName, firebaseClient]);

    const update = useCallback(async (docId, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await firebaseClient.update(collectionName, docId, data);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [collectionName, firebaseClient]);

    const remove = useCallback(async (docId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await firebaseClient.delete(collectionName, docId);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [collectionName, firebaseClient]);

    return { add, update, remove, loading, error };
};

// === Specialized Hooks (Domain-specific) ===

/**
 * Hook for sensor data - Uses generic useFirestore with specific options
 */
export const useSensorData = (siteId = null, limit = 50) => {
    const options = {
        orderBy: { field: 'timestamp', direction: 'desc' },
        limit
    };

    if (siteId) {
        options.where = { field: 'site_id', operator: '==', value: siteId };
    }

    return useFirestore('sensors_data', options);
};

/**
 * Hook for financial data
 */
export const useFinancialData = (siteId = null, limit = 30) => {
    const options = {
        orderBy: { field: 'timestamp', direction: 'desc' },
        limit
    };

    if (siteId) {
        options.where = { field: 'site_id', operator: '==', value: siteId };
    }

    return useFirestore('financial_data', options);
};

/**
 * Hook for tasks
 */
export const useTasks = (siteId = null, isCompleted = null) => {
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

export default useFirestore;
