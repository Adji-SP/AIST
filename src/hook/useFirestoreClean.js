// src/hook/useFirestoreClean.js
// CLEAN React hooks - Just handles React state, uses shared library for logic
import { useState, useEffect, useCallback } from 'react';
import { getFirebaseClient } from '@lib/client/firebaseClient';

// Cache for Firestore data to prevent unnecessary loading states
const dataCache = new Map();
const getCacheKey = (collectionName, options) => {
    return `${collectionName}_${JSON.stringify(options)}`;
};

/**
 * Clean Firestore hook - Real-time subscription to a collection
 * All Firebase logic is in the shared library
 * Now with caching to prevent re-loading on component remount
 */
export const useFirestore = (collectionName, options = {}) => {
    const cacheKey = getCacheKey(collectionName, options);
    const cachedData = dataCache.get(cacheKey);

    // Initialize with cached data if available
    const [data, setData] = useState(cachedData?.data || []);
    const [loading, setLoading] = useState(!cachedData); // Only show loading if no cache
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!collectionName) {
            setLoading(false);
            return;
        }

        // Only show loading if we don't have cached data
        if (!cachedData) {
            setLoading(true);
        }
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

                    // Update cache
                    dataCache.set(cacheKey, {
                        data: documents,
                        timestamp: Date.now()
                    });
                }
            }
        );

        // Cleanup subscription on unmount
        return unsubscribe;
    }, [collectionName, JSON.stringify(options), cacheKey, cachedData]);

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

/**
 * Utility to clear the Firestore cache
 * Use this to force a refresh of all data
 */
export const clearFirestoreCache = () => {
    dataCache.clear();
    console.log('🗑️ Firestore cache cleared');
};

/**
 * Utility to clear specific collection from cache
 */
export const clearCollectionCache = (collectionName, options = {}) => {
    const cacheKey = getCacheKey(collectionName, options);
    dataCache.delete(cacheKey);
    console.log(`🗑️ Cache cleared for: ${collectionName}`);
};

export default useFirestore;
