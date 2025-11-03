// src/hooks/useRealtimeData.js - Specialized hook for real-time data in your components
import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from './useApi';

// Hook for real-time sensor data (Data.jsx component)
export const useRealtimeSensorData = (siteId = 'site_a_3_acres', autoSubscribe = true) => {
    const { subscribe, unsubscribe, on, off, isConnected, wsConnected } = useApi();
    const [sensorData, setSensorData] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);
    
    const handleSensorUpdate = useCallback((data) => {
        console.log('🌡️ Sensor data updated:', data);
        setSensorData(data);
        setLastUpdated(new Date());
        setError(null);
    }, []);

    const handleError = useCallback((error) => {
        console.error('Sensor data error:', error);
        setError(error.message || 'Failed to receive sensor data');
    }, []);

    useEffect(() => {
        if (wsConnected && autoSubscribe) {
            // Subscribe to real-time sensor data
            subscribe('sensor_data', siteId, 10000); // Update every 10 seconds
            
            // Listen for updates
            on('sensor_data_update', handleSensorUpdate);
            on('websocket_error', handleError);
            
            console.log('📡 Subscribed to real-time sensor data');
        }

        return () => {
            if (wsConnected) {
                unsubscribe('sensor_data', siteId);
                off('sensor_data_update', handleSensorUpdate);
                off('websocket_error', handleError);
            }
        };
    }, [wsConnected, autoSubscribe, siteId, subscribe, unsubscribe, on, off, handleSensorUpdate, handleError]);

    return {
        sensorData,
        lastUpdated,
        error,
        isConnected: wsConnected
    };
};

// Hook for real-time task updates (Maintenance.jsx component)
export const useRealtimeTasks = (siteId = 'site_a_3_acres', autoSubscribe = true) => {
    const { subscribe, unsubscribe, on, off, wsConnected } = useApi();
    const [tasks, setTasks] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    const handleTaskUpdate = useCallback((taskData) => {
        console.log('📋 Task updated:', taskData);
        
        setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(task => 
                task.id === taskData.id ? { ...task, ...taskData } : task
            );
            return updatedTasks;
        });
        
        setLastUpdated(new Date());
    }, []);

    const handleInitialTasks = useCallback((data) => {
        if (data.upcoming_tasks) {
            setTasks(data.upcoming_tasks);
            setLastUpdated(new Date());
        }
    }, []);

    useEffect(() => {
        if (wsConnected && autoSubscribe) {
            subscribe('tasks', siteId, 60000); // Update every minute
            
            on('task_update', handleTaskUpdate);
            on('initial_data', handleInitialTasks);
        }

        return () => {
            if (wsConnected) {
                unsubscribe('tasks', siteId);
                off('task_update', handleTaskUpdate);
                off('initial_data', handleInitialTasks);
            }
        };
    }, [wsConnected, autoSubscribe, siteId, subscribe, unsubscribe, on, off, handleTaskUpdate, handleInitialTasks]);

    return {
        tasks,
        lastUpdated,
        isConnected: wsConnected
    };
};

// Hook for real-time system metrics (Overview.jsx component)
export const useRealtimeSystemMetrics = (autoSubscribe = true) => {
    const { subscribe, unsubscribe, on, off, wsConnected } = useApi();
    const [systemMetrics, setSystemMetrics] = useState({});
    const [lastUpdated, setLastUpdated] = useState(null);

    const handleMetricsUpdate = useCallback((data) => {
        console.log('⚙️ System metrics updated:', data);
        setSystemMetrics(data);
        setLastUpdated(new Date());
    }, []);

    const handleInitialData = useCallback((data) => {
        if (data.system_metrics) {
            setSystemMetrics(data.system_metrics);
            setLastUpdated(new Date());
        }
    }, []);

    useEffect(() => {
        if (wsConnected && autoSubscribe) {
            subscribe('system_metrics', null, 30000); // Update every 30 seconds
            
            on('system_metrics_update', handleMetricsUpdate);
            on('initial_data', handleInitialData);
        }

        return () => {
            if (wsConnected) {
                unsubscribe('system_metrics');
                off('system_metrics_update', handleMetricsUpdate);
                off('initial_data', handleInitialData);
            }
        };
    }, [wsConnected, autoSubscribe, subscribe, unsubscribe, on, off, handleMetricsUpdate, handleInitialData]);

    return {
        systemMetrics,
        lastUpdated,
        isConnected: wsConnected
    };
};

// Hook for real-time financial data (Finance.jsx component)
export const useRealtimeFinancialData = (siteId = 'site_a_3_acres', autoSubscribe = true) => {
    const { subscribe, unsubscribe, on, off, wsConnected } = useApi();
    const [financialData, setFinancialData] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    const handleFinancialUpdate = useCallback((data) => {
        console.log('💰 Financial data updated:', data);
        
        if (Array.isArray(data)) {
            setFinancialData(data);
        } else {
            // If single record, update or prepend to existing data
            setFinancialData(prevData => {
                const existingIndex = prevData.findIndex(item => 
                    item.timestamp === data.timestamp && item.site_id === data.site_id
                );
                
                if (existingIndex >= 0) {
                    // Update existing record
                    const updated = [...prevData];
                    updated[existingIndex] = data;
                    return updated;
                } else {
                    // Prepend new record and limit to 30 items
                    return [data, ...prevData].slice(0, 30);
                }
            });
        }
        
        setLastUpdated(new Date());
    }, []);

    useEffect(() => {
        if (wsConnected && autoSubscribe) {
            subscribe('financial_data', siteId, 300000); // Update every 5 minutes
            
            on('financial_data_update', handleFinancialUpdate);
        }

        return () => {
            if (wsConnected) {
                unsubscribe('financial_data', siteId);
                off('financial_data_update', handleFinancialUpdate);
            }
        };
    }, [wsConnected, autoSubscribe, siteId, subscribe, unsubscribe, on, off, handleFinancialUpdate]);

    return {
        financialData,
        lastUpdated,
        isConnected: wsConnected
    };
};

// Hook for real-time program goals (Finance.jsx component)
export const useRealtimeProgramGoals = (autoSubscribe = true) => {
    const { subscribe, unsubscribe, on, off, wsConnected } = useApi();
    const [programGoals, setProgramGoals] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    const handleGoalsUpdate = useCallback((data) => {
        console.log('🎯 Program goals updated:', data);
        setProgramGoals(Array.isArray(data) ? data : [data]);
        setLastUpdated(new Date());
    }, []);

    const handleInitialData = useCallback((data) => {
        if (data.program_goals) {
            setProgramGoals(data.program_goals);
            setLastUpdated(new Date());
        }
    }, []);

    useEffect(() => {
        if (wsConnected && autoSubscribe) {
            subscribe('program_goals', null, 3600000); // Update every hour
            
            on('program_goals_update', handleGoalsUpdate);
            on('initial_data', handleInitialData);
        }

        return () => {
            if (wsConnected) {
                unsubscribe('program_goals');
                off('program_goals_update', handleGoalsUpdate);
                off('initial_data', handleInitialData);
            }
        };
    }, [wsConnected, autoSubscribe, subscribe, unsubscribe, on, off, handleGoalsUpdate, handleInitialData]);

    return {
        programGoals,
        lastUpdated,
        isConnected: wsConnected
    };
};

// Composite hook for dashboard data (combines multiple real-time sources)
export const useRealtimeDashboard = (siteId = 'site_a_3_acres') => {
    const sensorData = useRealtimeSensorData(siteId, true);
    const tasks = useRealtimeTasks(siteId, true);
    const systemMetrics = useRealtimeSystemMetrics(true);
    const financialData = useRealtimeFinancialData(siteId, true);
    const programGoals = useRealtimeProgramGoals(true);

    return {
        sensorData: sensorData.sensorData,
        tasks: tasks.tasks,
        systemMetrics: systemMetrics.systemMetrics,
        financialData: financialData.financialData,
        programGoals: programGoals.programGoals,
        lastUpdated: new Date(Math.max(
            sensorData.lastUpdated?.getTime() || 0,
            tasks.lastUpdated?.getTime() || 0,
            systemMetrics.lastUpdated?.getTime() || 0,
            financialData.lastUpdated?.getTime() || 0,
            programGoals.lastUpdated?.getTime() || 0
        )),
        isConnected: sensorData.isConnected,
        errors: {
            sensor: sensorData.error,
        }
    };
};

// Custom hook for manual data refresh with real-time updates
export const useDataWithRealtime = (dataType, siteId, fetchFunction) => {
    const { subscribe, unsubscribe, on, off, wsConnected } = useApi();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const fetchRef = useRef(fetchFunction);

    // Update fetch function ref
    useEffect(() => {
        fetchRef.current = fetchFunction;
    }, [fetchFunction]);

    // Manual data fetching
    const fetchData = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchRef.current(filters);
            setData(result);
            setLastUpdated(new Date());
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Real-time update handler
    const handleRealtimeUpdate = useCallback((updatedData) => {
        console.log(`📡 Real-time ${dataType} update:`, updatedData);
        setData(prevData => {
            // Merge or replace data based on type
            if (Array.isArray(prevData) && Array.isArray(updatedData)) {
                return updatedData;
            } else if (Array.isArray(prevData) && !Array.isArray(updatedData)) {
                // Update single item in array
                return prevData.map(item => 
                    item.id === updatedData.id ? { ...item, ...updatedData } : item
                );
            } else {
                return updatedData;
            }
        });
        setLastUpdated(new Date());
    }, [dataType]);

    // Set up real-time subscription
    useEffect(() => {
        if (wsConnected) {
            subscribe(dataType, siteId, 30000);
            on(`${dataType}_update`, handleRealtimeUpdate);
        }

        return () => {
            if (wsConnected) {
                unsubscribe(dataType, siteId);
                off(`${dataType}_update`, handleRealtimeUpdate);
            }
        };
    }, [wsConnected, dataType, siteId, subscribe, unsubscribe, on, off, handleRealtimeUpdate]);

    return {
        data,
        loading,
        error,
        lastUpdated,
        fetchData,
        isConnected: wsConnected
    };
};