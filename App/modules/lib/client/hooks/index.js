// App/modules/lib/client/hooks/index.js
// Barrel export for all React hooks

// API hooks
export { useApi, useFetch, useApiSensorData, useSerialConnection, useSensorData } from './useApi';

// Firestore hooks
export {
    useFirestore,
    useFirestoreMutations,
    useSensorData as useFirestoreSensorData,
    useFinancialData,
    useTasks,
    clearFirestoreCache,
    clearCollectionCache
} from './useFirestore';

// Real-time WebSocket hooks
export {
    useRealtime,
    useWebSocketStatus,
    useRealtimeSensorData,
    useRealtimeTasks,
    useRealtimeSystemMetrics,
    useRealtimeFinancialData,
    useRealtimeProgramGoals,
    useRealtimeDashboard,
    useWebSocketEvent
} from './useRealtime';
