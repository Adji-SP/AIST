// App/modules/lib/client/hooks/useFirestore.js
// React hook for Firestore — thin wrapper around App's FirebaseClient with React state
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getFirebaseClient } from '../firebaseClient';

// Cache for Firestore data to prevent unnecessary loading states
const dataCache = new Map();
const getCacheKey = (collectionName, stringifiedOptions) => {
    return `${collectionName}_${stringifiedOptions}`;
};

/**
 * Clean Firestore hook — Real-time subscription to a collection
 * All Firebase logic is in the shared library
 * Now with caching to prevent re-loading on component remount
 */
export const useFirestore = (collectionName, options = {}) => {
    // Stringify options to stabilize the dependency array (prevent infinite loop on inline objects)
    const optionsStr = JSON.stringify(options);

    // Memoize the cache key to prevent unnecessary recalculations
    const cacheKey = useMemo(() => getCacheKey(collectionName, optionsStr), [collectionName, optionsStr]);
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

        // Get current cached data at effect execution time
        const currentCachedData = dataCache.get(cacheKey);

        // Only show loading if we don't have cached data
        if (!currentCachedData) {
            setLoading(true);
        }
        setError(null);

        const firebaseClient = getFirebaseClient();

        // Subscribe to real-time updates
        const parsedOptions = JSON.parse(optionsStr);
        const unsubscribe = firebaseClient.subscribe(
            collectionName,
            parsedOptions,
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
    }, [collectionName, cacheKey, optionsStr]);

    return { data, loading, error };
};

/**
 * Firestore mutations hook — CRUD operations
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

    return { add, addDocument: add, update, remove, loading, error };
};

// === Specialized Hooks (Domain-specific) ===

/**
 * Hook for sensor data — Uses generic useFirestore with specific options
 */
export const useSensorData = (siteId = null, limit = 50, role = 'user', userDevices = []) => {
    // Sanitize userDevices: remove nulls/undefined and limit to 10 (Firestore 'in' max limit)
    let safeDeviceIds = Array.isArray(userDevices) ? userDevices.filter(id => id) : [];
    if (safeDeviceIds.length === 0) safeDeviceIds = ['UNASSIGNED_FALLBACK'];
    if (safeDeviceIds.length > 10) safeDeviceIds = safeDeviceIds.slice(0, 10);

    const options = {
        limit
    };

    if (role === 'admin' && siteId) {
        options.where = { field: 'site_id', operator: '==', value: siteId };
    } else {
        options.where = { field: 'device_id', operator: 'in', value: safeDeviceIds };
    }

    return useFirestore('sensors_data', options);
};

/**
 * Hook for financial data
 */
export const useFinancialData = (siteId = null, limit = 30) => {
    const options = {
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
export const useTasks = (siteId = null, role = 'user', uid = null, isCompleted = null) => {
    const options = {};

    const whereConditions = [];

    // Admins see all tasks for a site, Users see only their own tasks
    if (role !== 'admin' && uid) {
        whereConditions.push({ field: 'assigned_to_uid', operator: '==', value: uid });
    }

    if (siteId && role === 'admin') {
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
 */
export const clearFirestoreCache = () => {
    dataCache.clear();
    console.log('🗑️ Firestore cache cleared');
};

/**
 * Utility to clear specific collection from cache
 */
export const clearCollectionCache = (collectionName, options = {}) => {
    const cacheKey = getCacheKey(collectionName, JSON.stringify(options));
    dataCache.delete(cacheKey);
    console.log(`🗑️ Cache cleared for: ${collectionName}`);
};

export default useFirestore;
