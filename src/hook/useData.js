// src/hook/useData.js
// React hook for data fetching using the unified service layer

import { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';

/**
 * Hook for fetching data from any table
 * Automatically uses IPC (Electron) or API (Standalone)
 * Benefits from backend services: encryption, validation, logging
 */
export const useData = (table, filters = {}, options = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await dataService.getDataByFilters(table, filters, options);
            setData(result || []);
        } catch (err) {
            console.error(`Failed to fetch ${table}:`, err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [table, JSON.stringify(filters), JSON.stringify(options)]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(() => {
        return fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
};

/**
 * Hook for inserting data
 */
export const useInsertData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const insertData = useCallback(async (table, data) => {
        try {
            setLoading(true);
            setError(null);
            const result = await dataService.insertData(table, data);
            return result;
        } catch (err) {
            console.error(`Failed to insert into ${table}:`, err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { insertData, loading, error };
};

/**
 * Hook for sensor data specifically
 */
export const useSensorData = (filters = {}, options = {}) => {
    return useData('sensor_data', filters, {
        orderBy: 'timestamp',
        orderDirection: 'DESC',
        limit: 50,
        ...options
    });
};

/**
 * Hook for serial connection status (Electron only)
 */
export const useSerialStatus = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatus = useCallback(async () => {
        if (!dataService.isElectronMode()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await dataService.getSerialStatus();
            setStatus(result.data || result);
        } catch (err) {
            console.error('Failed to fetch serial status:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();

        // Poll every 5 seconds
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const reconnect = useCallback(async () => {
        try {
            await dataService.serialForceReconnect();
            await fetchStatus();
        } catch (err) {
            console.error('Failed to reconnect:', err);
            setError(err);
        }
    }, [fetchStatus]);

    return { status, loading, error, refetch: fetchStatus, reconnect };
};

export default useData;
