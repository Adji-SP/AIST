// src/hook/useRealtimeClean.js
// CLEAN React hooks for real-time WebSocket data
import { useState, useEffect, useCallback } from 'react';
import { getWebSocketClient } from '../../App/modules/lib/client/websocketClient';

/**
 * Main real-time hook - Subscribe to WebSocket topics
 * @param {string} topic - Topic to subscribe to (e.g., 'sensor_data', 'tasks')
 * @param {string} filter - Optional filter (e.g., site_id)
 * @param {number} interval - Update interval in ms
 */
export const useRealtime = (topic, filter = null, interval = 30000) => {
    const [data, setData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        if (!topic) return;

        const wsClient = getWebSocketClient();

        // Handle connection status
        const handleConnected = () => setConnected(true);
        const handleDisconnected = () => setConnected(false);
        const handleError = (err) => setError(err);

        // Handle data updates
        const handleUpdate = (updateData) => {
            setData(updateData);
            setLastUpdated(new Date());
            setError(null);
        };

        // Register listeners
        wsClient.on('connected', handleConnected);
        wsClient.on('disconnected', handleDisconnected);
        wsClient.on('error', handleError);
        wsClient.on(`${topic}_update`, handleUpdate);
        wsClient.on('initial_data', handleUpdate);

        // Subscribe to topic
        wsClient.subscribe(topic, filter, interval);

        // Set initial connection status
        setConnected(wsClient.isConnected());

        // Cleanup
        return () => {
            wsClient.off('connected', handleConnected);
            wsClient.off('disconnected', handleDisconnected);
            wsClient.off('error', handleError);
            wsClient.off(`${topic}_update`, handleUpdate);
            wsClient.off('initial_data', handleUpdate);
            wsClient.unsubscribe(topic, filter);
        };
    }, [topic, filter, interval]);

    return { data, connected, error, lastUpdated };
};

/**
 * Hook for WebSocket connection status
 */
export const useWebSocketStatus = () => {
    const [connected, setConnected] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);

    useEffect(() => {
        const wsClient = getWebSocketClient();

        const handleConnected = () => {
            setConnected(true);
            setReconnecting(false);
        };

        const handleDisconnected = () => {
            setConnected(false);
            setReconnecting(false);
        };

        const handleReconnecting = () => {
            setReconnecting(true);
        };

        wsClient.on('connected', handleConnected);
        wsClient.on('disconnected', handleDisconnected);
        wsClient.on('reconnecting', handleReconnecting);

        setConnected(wsClient.isConnected());

        return () => {
            wsClient.off('connected', handleConnected);
            wsClient.off('disconnected', handleDisconnected);
            wsClient.off('reconnecting', handleReconnecting);
        };
    }, []);

    return { connected, reconnecting };
};

// ============= Specialized Hooks =============

/**
 * Hook for real-time sensor data
 */
export const useRealtimeSensorData = (siteId = null, interval = 10000) => {
    return useRealtime('sensor_data', siteId, interval);
};

/**
 * Hook for real-time tasks
 */
export const useRealtimeTasks = (siteId = null, interval = 60000) => {
    return useRealtime('tasks', siteId, interval);
};

/**
 * Hook for real-time system metrics
 */
export const useRealtimeSystemMetrics = (interval = 30000) => {
    return useRealtime('system_metrics', null, interval);
};

/**
 * Hook for real-time financial data
 */
export const useRealtimeFinancialData = (siteId = null, interval = 300000) => {
    return useRealtime('financial_data', siteId, interval);
};

/**
 * Hook for real-time program goals
 */
export const useRealtimeProgramGoals = (interval = 3600000) => {
    return useRealtime('program_goals', null, interval);
};

/**
 * Composite hook - Combine multiple real-time data sources
 */
export const useRealtimeDashboard = (siteId = null) => {
    const sensorData = useRealtimeSensorData(siteId);
    const tasks = useRealtimeTasks(siteId);
    const systemMetrics = useRealtimeSystemMetrics();
    const financialData = useRealtimeFinancialData(siteId);
    const programGoals = useRealtimeProgramGoals();

    const loading = !sensorData.connected;
    const lastUpdated = new Date(Math.max(
        sensorData.lastUpdated?.getTime() || 0,
        tasks.lastUpdated?.getTime() || 0,
        systemMetrics.lastUpdated?.getTime() || 0,
        financialData.lastUpdated?.getTime() || 0,
        programGoals.lastUpdated?.getTime() || 0
    ));

    return {
        sensorData: sensorData.data,
        tasks: tasks.data,
        systemMetrics: systemMetrics.data,
        financialData: financialData.data,
        programGoals: programGoals.data,
        connected: sensorData.connected,
        loading,
        lastUpdated,
        errors: {
            sensor: sensorData.error,
            tasks: tasks.error,
            systemMetrics: systemMetrics.error,
            financialData: financialData.error,
            programGoals: programGoals.error
        }
    };
};

/**
 * Hook for custom WebSocket events
 */
export const useWebSocketEvent = (eventName, callback) => {
    useEffect(() => {
        if (!eventName || !callback) return;

        const wsClient = getWebSocketClient();
        wsClient.on(eventName, callback);

        return () => {
            wsClient.off(eventName, callback);
        };
    }, [eventName, callback]);
};

export default useRealtime;
