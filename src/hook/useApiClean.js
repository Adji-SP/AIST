// src/hook/useApiClean.js
// CLEAN React hooks for API - Just React state, uses shared library
import { useState, useCallback, useEffect } from 'react';
import { getApiClient } from '../../App/modules/lib/client/apiClient';

/**
 * Clean API hook - Handles API requests with loading/error states
 */
export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiClient = getApiClient();

    const request = useCallback(async (apiMethod, ...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiMethod(...args);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        // Direct API methods
        get: useCallback((endpoint, params) => request(apiClient.get.bind(apiClient), endpoint, params), [apiClient, request]),
        post: useCallback((endpoint, data) => request(apiClient.post.bind(apiClient), endpoint, data), [apiClient, request]),
        put: useCallback((endpoint, data) => request(apiClient.put.bind(apiClient), endpoint, data), [apiClient, request]),
        delete: useCallback((endpoint) => request(apiClient.delete.bind(apiClient), endpoint), [apiClient, request]),
        // Convenience methods
        getSensorData: useCallback((filters) => request(apiClient.getSensorData.bind(apiClient), filters), [apiClient, request]),
        insertSensorData: useCallback((data) => request(apiClient.insertSensorData.bind(apiClient), data), [apiClient, request]),
        getDataByFilters: useCallback((table, filters, options) => request(apiClient.getDataByFilters.bind(apiClient), table, filters, options), [apiClient, request]),
        healthCheck: useCallback(() => request(apiClient.healthCheck.bind(apiClient)), [apiClient, request])
    };
};

/**
 * Hook for fetching data with automatic loading/error handling
 */
export const useFetch = (fetchFunction, deps = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetch = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFunction(...args);
            setData(result);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchFunction]);

    return { data, loading, error, fetch, refetch: fetch };
};

/**
 * Hook for sensor data from API (not real-time, just fetching)
 */
export const useApiSensorData = (filters = {}) => {
    const { getSensorData } = useApi();
    return useFetch(() => getSensorData(filters), [JSON.stringify(filters)]);
};

/**
 * Hook for serial connection status
 * TODO: Implement proper serial connection via Electron IPC
 */
export const useSerialConnection = () => {
    const [status, setStatus] = useState({
        connected: false,
        port: null,
        error: null
    });

    const reconnect = useCallback(async () => {
        // TODO: Implement via Electron IPC
        console.warn('useSerialConnection.reconnect() not yet implemented');
    }, []);

    useEffect(() => {
        // TODO: Implement serial status monitoring via Electron IPC
        // For now, return disconnected status
    }, []);

    return { status, reconnect };
};

/**
 * Alias for backward compatibility
 */
export const useSensorData = useApiSensorData;

export default useApi;
