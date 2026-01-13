/**
 * Constants Registry
 *
 * Centralized location for all magic strings, table names, event names, and other constants
 * used throughout the framework. This prevents split-brain bugs and makes refactoring safer.
 *
 * IMPORTANT: All framework code should import constants from this file instead of using
 * hardcoded strings. This ensures consistency and makes it easy to track where constants
 * are used throughout the codebase.
 */

/**
 * Database Table Names
 * All table/collection names used in the application
 */
const TABLE_NAMES = {
    // Core tables
    USERS: 'users',

    // Sensor data tables
    SENSOR_DATA: 'sensor_data',
    SENSORS: 'sensors',
    TEMPERATURE_DATA: 'temperature_data',
    PRESSURE_DATA: 'pressure_data',
    PH_DATA: 'ph_data',

    // Test tables
    TEST: 'test',
};

/**
 * Framework Event Names
 * Events emitted by the bootstrap and module managers
 */
const EVENTS = {
    // Bootstrap lifecycle events
    READY: 'ready',
    ERROR: 'error',
    SHUTDOWN: 'shutdown',

    // Module initialization events
    ENCRYPTION_READY: 'encryption:ready',
    DATABASE_READY: 'database:ready',
    WINDOW_READY: 'window:ready',
    API_READY: 'api:ready',
    SERIAL_READY: 'serial:ready',
    WEBSOCKET_READY: 'websocket:ready',
    IPC_READY: 'ipc:ready',

    // Data events (for future EventBus)
    DATA_RECEIVED: 'data:received',
    DATA_SAVED: 'data:saved',
    DATA_ERROR: 'data:error',

    // Connection events
    CONNECTION_OPENED: 'connection:opened',
    CONNECTION_CLOSED: 'connection:closed',
    CONNECTION_ERROR: 'connection:error',
};

/**
 * Database Types
 * Supported database backend types
 */
const DATABASE_TYPES = {
    MYSQL: 'mysql',
    FIRESTORE: 'firestore',
    FIREBASE: 'firebase', // Legacy alias for firestore
    COSMOSDB: 'cosmosdb',
    HYBRID: 'hybrid', // MySQL primary + Firestore secondary
    HYBRID_COSMOS: 'hybrid-cosmos', // MySQL primary + Cosmos secondary
};

/**
 * Environment Modes
 * Runtime environment detection results
 */
const ENVIRONMENT_MODES = {
    ELECTRON: 'electron',
    EXPRESS: 'express',
    REACT: 'react',
    NODE: 'node',
    SERVERLESS: 'serverless',
    STANDALONE: 'standalone',
};

/**
 * HTTP Status Codes
 * Common HTTP status codes used in API responses
 */
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};

/**
 * Encryption Configuration
 * Constants related to encryption/decryption
 */
const ENCRYPTION = {
    ALGORITHM: 'aes-256-cbc',
    IV_LENGTH: 16,
    KEY_HASH_ALGORITHM: 'sha256',

    // Fields that should be automatically encrypted
    SENSITIVE_FIELDS: ['password', 'email', 'phone', 'address', 'name'],
};

/**
 * Serial Communication
 * Constants for serial port communication
 */
const SERIAL = {
    DEFAULT_BAUD_RATE: 9600,
    DEFAULT_DATA_BITS: 8,
    DEFAULT_STOP_BITS: 1,
    DEFAULT_PARITY: 'none',

    PARITY_OPTIONS: {
        NONE: 'none',
        EVEN: 'even',
        ODD: 'odd',
        MARK: 'mark',
        SPACE: 'space',
    },

    DATA_TYPES: {
        JSON_OBJECT: 'json-object',
        JSON_ARRAY: 'json-array',
        CSV: 'csv',
        RAW: 'raw',
    },
};

/**
 * WebSocket Configuration
 * Constants for WebSocket server
 */
const WEBSOCKET = {
    DEFAULT_PORT: 8080,
    DEFAULT_HOST: '0.0.0.0',
    DEFAULT_PATH: '/socket.io',
    DEFAULT_MAX_CONNECTIONS: 100,
    DEFAULT_HEARTBEAT_INTERVAL: 30000, // 30 seconds

    EVENTS: {
        CONNECTION: 'connection',
        DISCONNECT: 'disconnect',
        MESSAGE: 'message',
        ERROR: 'error',
        DATA: 'data',
    },
};

/**
 * API Configuration
 * Constants for REST API server
 */
const API = {
    DEFAULT_PORT: 3001,
    DEFAULT_HOST: 'localhost',

    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100,
    },

    ENDPOINTS: {
        HEALTH: '/api/health',
        AUTH_REGISTER: '/api/auth/register',
        AUTH_LOGIN: '/api/auth/login',
        SENSOR_DATA: '/api/sensor-data',
        MAUI_DATA: '/api/maui-data',
    },
};

/**
 * Window Configuration
 * Constants for Electron window management
 */
const WINDOW = {
    DEFAULT_WIDTH: 1280,
    DEFAULT_HEIGHT: 800,
    MIN_WIDTH: 800,
    MIN_HEIGHT: 600,
};

/**
 * Log Levels
 * Logging verbosity levels
 */
const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
    TRACE: 'trace',
};

/**
 * Validation Rules
 * Common validation patterns
 */
const VALIDATION = {
    PATTERNS: {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        URL: /^https?:\/\/.+/,
        IPV4: /^(\d{1,3}\.){3}\d{1,3}$/,
        PORT: /^\d{1,5}$/,
    },

    RULES: {
        REQUIRED: 'required',
        EMAIL: 'email',
        MIN_LENGTH: 'min_length',
        MAX_LENGTH: 'max_length',
        NUMERIC: 'numeric',
        ALPHA: 'alpha',
        ALPHANUMERIC: 'alphanumeric',
    },
};

/**
 * IPC Channel Names
 * Inter-Process Communication channel identifiers (for Electron)
 */
const IPC_CHANNELS = {
    // Data operations
    GET_TEMP_DATA: 'get-temp-data',
    GET_PRESSURE_DATA: 'get-pressure-data',
    GET_ALL_DATA: 'get-all-data',
    GET_FILTERED_DATA: 'get-filtered-data',
    DELETE_DATA: 'delete-data',
    INSERT_TEMP_DATA: 'insert-temp-data',
    INSERT_PRESSURE_DATA: 'insert-pressure-data',

    // Serial operations
    GET_SERIAL_STATUS: 'get-serial-status',
    RECONNECT_SERIAL: 'reconnect-serial',
    DISCONNECT_SERIAL: 'disconnect-serial',
    SCAN_PORTS: 'scan-ports',
    TOGGLE_DYNAMIC_SWITCHING: 'toggle-dynamic-switching',

    // WebSocket operations
    GET_WEBSOCKET_STATUS: 'get-websocket-status',
    BROADCAST_MESSAGE: 'broadcast-message',

    // System operations
    GET_SYSTEM_INFO: 'get-system-info',
};

/**
 * Error Messages
 * Standard error message templates
 */
const ERROR_MESSAGES = {
    // Authentication errors
    INVALID_CREDENTIALS: 'Invalid username or password',
    USER_ALREADY_EXISTS: 'User already exists',
    UNAUTHORIZED: 'Unauthorized access',

    // Database errors
    DATABASE_NOT_INITIALIZED: 'Database not initialized',
    DATABASE_CONNECTION_FAILED: 'Failed to connect to database',
    DATABASE_QUERY_FAILED: 'Database query failed',

    // Validation errors
    REQUIRED_FIELD_MISSING: 'Required field is missing',
    INVALID_EMAIL: 'Invalid email address',
    INVALID_DATA_FORMAT: 'Invalid data format',

    // Configuration errors
    CONFIG_MISSING: 'Configuration is missing',
    ENCRYPTION_KEY_MISSING: 'Encryption key must be provided. Set DB_ENCRYPTION_KEY environment variable.',

    // Service errors
    SERVICE_NOT_INITIALIZED: 'Service not initialized',
    SERVICE_UNAVAILABLE: 'Service is unavailable',
};

/**
 * Success Messages
 * Standard success message templates
 */
const SUCCESS_MESSAGES = {
    DATA_SAVED: 'Data saved successfully',
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
    OPERATION_COMPLETE: 'Operation completed successfully',
};

// Export all constants
module.exports = {
    // Main constants
    TABLE_NAMES,
    EVENTS,
    DATABASE_TYPES,
    ENVIRONMENT_MODES,
    HTTP_STATUS,
    ENCRYPTION,
    SERIAL,
    WEBSOCKET,
    API,
    WINDOW,
    LOG_LEVELS,
    VALIDATION,
    IPC_CHANNELS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,

    // Convenience: Export commonly used constants at top level
    TABLES: TABLE_NAMES, // Alias for brevity
    DB_TYPES: DATABASE_TYPES, // Alias for brevity
};
