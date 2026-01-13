# AIST Monitor Framework - Implementation Guide

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Backend Integration](#backend-integration)
- [Frontend Integration](#frontend-integration)
- [Core Services](#core-services)
- [Event System](#event-system)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)
- [Examples](#examples)

---

## Overview

The AIST Monitor Framework is a modular, event-driven backend framework that supports multiple runtime environments (Electron, Express, Standalone Node.js, Serverless). It provides centralized services for database operations, validation, logging, encryption, and event management.

### Key Features

- 🔧 **Multi-Database Support** - MySQL, Firebase Firestore, Azure Cosmos DB
- 📡 **Event-Driven Architecture** - Centralized EventBus for module communication
- ✅ **Built-in Validation** - Schema-based validation with extensible rules
- 🔒 **Encryption Service** - AES-256-CBC encryption for sensitive data
- 📊 **Structured Logging** - Multi-level logging with file rotation
- ⚙️ **Centralized Configuration** - Environment-aware configuration management
- 🔄 **Graceful Shutdown** - Proper cleanup with timeout support

---

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Edit .env with your configuration
# Required: DB_ENCRYPTION_KEY
```

### Minimal Backend Setup

```javascript
// server.js
const bootstrap = require('./App/bootstrap');

async function startServer() {
    try {
        // Initialize the framework
        await bootstrap.bootstrap({
            mode: 'standalone', // or 'electron', 'express', 'serverless'
            modules: {
                database: true,
                api: true,
                websocket: false,
                serial: false,
                ipc: false
            }
        });

        console.log('✅ Server started successfully');

        // Listen for ready event
        bootstrap.on('ready', () => {
            console.log('🚀 All modules initialized');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await bootstrap.shutdown({ timeout: 10000 });
    process.exit(0);
});

startServer();
```

### Environment Variables

```bash
# .env file

# Database Configuration (MySQL example)
DB_TYPE=mysql
DB_ENCRYPTION_KEY=your-32-character-encryption-key-here!!

# MySQL Settings
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=monitor_db

# API Server
API_PORT=3001
API_HOST=localhost

# WebSocket Server (optional)
WEBSOCKET_PORT=8080
WEBSOCKET_ENABLE_AUTH=false

# Logging
LOG_LEVEL=info
```

---

## Backend Integration

### 1. Express.js Application

```javascript
// express-server.js
const express = require('express');
const bootstrap = require('./App/bootstrap');

async function startExpressServer() {
    const app = express();

    // Initialize framework
    await bootstrap.bootstrap({
        mode: 'express',
        modules: {
            database: true,
            api: false, // We're using Express directly
            websocket: true
        }
    });

    // Get services
    const dbManager = bootstrap.getModule('database');
    const db = dbManager.getDatabase();

    // Your Express routes
    app.get('/api/sensors', async (req, res) => {
        try {
            const sensors = await db.getDataByFilters('sensors');
            res.json({ success: true, data: sensors });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/sensor-data', async (req, res) => {
        try {
            const result = await db.postData('sensor_data', req.body);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Express server listening on port ${PORT}`);
    });
}

startExpressServer();
```

### 2. Using Services Directly

```javascript
// services-example.js
const { getInstance: getEventBus } = require('./App/modules/lib/events/EventBus');
const { getInstance: getValidation } = require('./App/modules/lib/services/ValidationService');
const { getInstance: getLogger } = require('./App/modules/lib/services/LoggingService');
const DatabaseService = require('./App/modules/lib/services/DatabaseService');
const { TABLE_NAMES } = require('./App/config/constants');

// Initialize services
const eventBus = getEventBus();
const validation = getValidation();
const logger = getLogger();

// After bootstrap initializes database
async function setupServices(bootstrap) {
    const dbManager = bootstrap.getModule('database');
    const dbAdapter = dbManager.getDatabase();

    // Create DatabaseService
    const dbService = new DatabaseService(dbAdapter, validation);

    // Subscribe to data events
    eventBus.on('data:saved', (data) => {
        logger.info('Data saved', data);
    });

    eventBus.on('data:error', (error) => {
        logger.error('Database error', error);
    });

    return { dbService, eventBus, validation, logger };
}

// Example usage
async function saveSensorData(dbService, sensorData) {
    try {
        // Validation happens automatically
        const result = await dbService.insert(
            TABLE_NAMES.SENSOR_DATA,
            sensorData,
            { validate: true, emit: true }
        );
        return result;
    } catch (error) {
        logger.error('Failed to save sensor data', { error: error.message });
        throw error;
    }
}
```

### 3. Microservices / Serverless

```javascript
// lambda-handler.js (AWS Lambda example)
const bootstrap = require('./App/bootstrap');
const DatabaseService = require('./App/modules/lib/services/DatabaseService');

let isInitialized = false;
let dbService;

async function initialize() {
    if (isInitialized) return;

    await bootstrap.bootstrap({
        mode: 'serverless',
        modules: {
            database: true,
            api: false,
            websocket: false,
            serial: false,
            ipc: false
        }
    });

    const dbManager = bootstrap.getModule('database');
    const db = dbManager.getDatabase();
    dbService = new DatabaseService(db);

    isInitialized = true;
}

exports.handler = async (event, context) => {
    // Initialize once (Lambda container reuse)
    await initialize();

    try {
        const { tableName, data } = JSON.parse(event.body);

        const result = await dbService.insert(tableName, data);

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
```

---

## Frontend Integration

### 1. React Application

```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    // Sensor data operations
    async getSensorData(limit = 50) {
        const response = await this.client.get('/api/sensor-data', {
            params: { limit }
        });
        return response.data;
    }

    async saveSensorData(data) {
        const response = await this.client.post('/api/sensor-data', data);
        return response.data;
    }

    // Temperature data
    async getTemperatureData(filters = {}) {
        const response = await this.client.get('/api/temperature-data', {
            params: filters
        });
        return response.data;
    }

    // Health check
    async healthCheck() {
        const response = await this.client.get('/api/health');
        return response.data;
    }
}

export default new ApiService();
```

```jsx
// src/components/SensorDashboard.jsx
import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

function SensorDashboard() {
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSensorData();
    }, []);

    const loadSensorData = async () => {
        try {
            setLoading(true);
            const result = await ApiService.getSensorData(100);
            if (result.success) {
                setSensorData(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNewData = async (newData) => {
        try {
            await ApiService.saveSensorData(newData);
            loadSensorData(); // Refresh
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="sensor-dashboard">
            <h1>Sensor Data</h1>
            <div className="sensor-list">
                {sensorData.map((sensor, idx) => (
                    <div key={idx} className="sensor-item">
                        <span>{sensor.sensor_id}</span>
                        <span>{sensor.value}</span>
                        <span>{new Date(sensor.timestamp).toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SensorDashboard;
```

### 2. WebSocket Integration (Real-time Updates)

```javascript
// src/services/websocket.js
import io from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(url = 'http://localhost:8080') {
        this.socket = io(url, {
            transports: ['websocket'],
            autoConnect: true
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
        });

        // Handle incoming data
        this.socket.on('data', (data) => {
            this.notifyListeners('data', data);
        });

        return this.socket;
    }

    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(data));
    }

    send(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default new WebSocketService();
```

```jsx
// src/components/LiveSensorMonitor.jsx
import React, { useState, useEffect } from 'react';
import WebSocketService from '../services/websocket';

function LiveSensorMonitor() {
    const [liveData, setLiveData] = useState([]);

    useEffect(() => {
        // Connect to WebSocket
        WebSocketService.connect();

        // Subscribe to data updates
        const unsubscribe = WebSocketService.subscribe('data', (newData) => {
            setLiveData(prev => [newData, ...prev].slice(0, 50)); // Keep last 50
        });

        // Cleanup
        return () => {
            unsubscribe();
            WebSocketService.disconnect();
        };
    }, []);

    return (
        <div className="live-monitor">
            <h2>Live Sensor Data</h2>
            <div className="live-data-stream">
                {liveData.map((data, idx) => (
                    <div key={idx} className="data-item animate-fade-in">
                        <span className="timestamp">
                            {new Date(data.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="value">{data.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LiveSensorMonitor;
```

### 3. Electron Renderer Process

```javascript
// renderer/preload.js (already set up in framework)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Temperature data
    getTemperatureData: (limit) => ipcRenderer.invoke('get-temp-data', limit),

    // Pressure data
    getPressureData: (limit) => ipcRenderer.invoke('get-pressure-data', limit),

    // Insert data
    insertTemperatureData: (data) => ipcRenderer.invoke('insert-temp-data', data),

    // Serial port operations
    getSerialStatus: () => ipcRenderer.invoke('get-serial-status'),
    reconnectSerial: () => ipcRenderer.invoke('reconnect-serial'),

    // WebSocket operations
    getWebSocketStatus: () => ipcRenderer.invoke('get-websocket-status')
});
```

```javascript
// renderer/app.js
async function loadTemperatureData() {
    try {
        const data = await window.electronAPI.getTemperatureData(100);
        displayData(data);
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

async function saveTemperatureReading(reading) {
    try {
        const result = await window.electronAPI.insertTemperatureData({
            temperature: reading.value,
            timestamp: new Date().toISOString()
        });
        console.log('Saved:', result);
    } catch (error) {
        console.error('Failed to save:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTemperatureData();

    // Refresh every 5 seconds
    setInterval(loadTemperatureData, 5000);
});
```

---

## Core Services

### DatabaseService

```javascript
const DatabaseService = require('./App/modules/lib/services/DatabaseService');
const { TABLE_NAMES } = require('./App/config/constants');

// After bootstrap initialization
const dbManager = bootstrap.getModule('database');
const dbAdapter = dbManager.getDatabase();
const dbService = new DatabaseService(dbAdapter);

// Insert data
const result = await dbService.insert(TABLE_NAMES.SENSOR_DATA, {
    sensor_id: 'temp_01',
    value: 25.5,
    timestamp: new Date()
});

// Find records
const sensors = await dbService.find(TABLE_NAMES.SENSORS, {
    status: 'active'
}, {
    limit: 10,
    orderBy: 'created_at'
});

// Find by ID
const sensor = await dbService.findById(TABLE_NAMES.SENSORS, 'sensor-123');

// Update records
await dbService.update(
    TABLE_NAMES.SENSORS,
    { status: 'inactive' },
    'id = ?',
    ['sensor-123']
);

// Delete records
await dbService.delete(TABLE_NAMES.SENSORS, 'id = ?', ['sensor-123']);

// Count records
const count = await dbService.count(TABLE_NAMES.SENSORS, { status: 'active' });

// Health check
const health = await dbService.healthCheck();
console.log('Database health:', health);
```

### ValidationService

```javascript
const { getInstance: getValidation } = require('./App/modules/lib/services/ValidationService');

const validation = getValidation();

// Validate data against schema
const result = validation.validate(
    {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'securePass123'
    },
    {
        username: { required: true, minLength: 3, alphanumeric: true },
        email: { required: true, email: true },
        password: { required: true, minLength: 8 }
    }
);

if (!result.valid) {
    console.error('Validation errors:', result.errors);
}

// Validate single field
const emailResult = validation.validateField(
    'test@example.com',
    { required: true, email: true },
    'email'
);

// Register custom validator
validation.registerCustomValidator('customCheck', (value, data) => {
    if (value !== 'expected') {
        return 'Custom validation failed';
    }
    return true;
});

// Use table-specific validation
const tableResult = validation.validateTableData('users', {
    username: 'newuser',
    email: 'user@test.com',
    password: 'password123'
});
```

### LoggingService

```javascript
const { getInstance: getLogger } = require('./App/modules/lib/services/LoggingService');

const logger = getLogger({
    level: 'info',
    enableConsole: true,
    enableFile: true,
    logFilePath: './logs/app.log'
});

// Log messages at different levels
logger.error('Critical error occurred', { code: 'ERR_001', details: '...' });
logger.warn('Warning message', { userId: 123 });
logger.info('Information message', { event: 'user_login' });
logger.debug('Debug information', { query: 'SELECT * FROM users' });
logger.trace('Trace message', { stackTrace: '...' });

// Create child logger with context
const userLogger = logger.child({ userId: 123, session: 'abc' });
userLogger.info('User action'); // Includes userId and session in all logs

// Change log level dynamically
logger.setLevel('debug');

// Enable/disable outputs
logger.setConsoleLogging(false);
logger.setFileLogging(true);
```

### EventBus

```javascript
const { getInstance: getEventBus } = require('./App/modules/lib/events/EventBus');

const eventBus = getEventBus();

// Subscribe to events
const subscriptionId = eventBus.on('user:login', (userData) => {
    console.log('User logged in:', userData);
});

// One-time subscription
eventBus.once('app:initialized', () => {
    console.log('App ready!');
});

// Emit events
eventBus.emit('user:login', { userId: 123, username: 'john' });

// Unsubscribe
eventBus.off('user:login', subscriptionId);

// Wait for an event (async)
const result = await eventBus.waitFor('data:processed', 5000);

// Namespaced events
const dbEvents = eventBus.namespace('database');
dbEvents.on('connected', () => console.log('DB connected'));
dbEvents.emit('connected');

// Get statistics
const stats = eventBus.getStats();
console.log('Event stats:', stats);

// Get event history (debugging)
const history = eventBus.getEventHistory(20);
console.log('Recent events:', history);
```

---

## Event System

### Framework Events

The framework emits these lifecycle events:

```javascript
const { EVENTS } = require('./App/config/constants');
const bootstrap = require('./App/bootstrap');

// Ready event - fired when all modules initialized
bootstrap.on(EVENTS.READY, () => {
    console.log('Framework ready!');
});

// Error event - fired on initialization errors
bootstrap.on(EVENTS.ERROR, (error) => {
    console.error('Framework error:', error);
});

// Module-specific events
bootstrap.on(EVENTS.DATABASE_READY, (dbManager) => {
    console.log('Database ready');
});

bootstrap.on(EVENTS.API_READY, (apiServer) => {
    console.log('API server ready');
});

bootstrap.on(EVENTS.WEBSOCKET_READY, (wsManager) => {
    console.log('WebSocket ready');
});

// Shutdown event
bootstrap.on(EVENTS.SHUTDOWN, () => {
    console.log('Framework shutdown complete');
});
```

### Custom Events

```javascript
const { getInstance: getEventBus } = require('./App/modules/lib/events/EventBus');
const eventBus = getEventBus();

// Define your own events
eventBus.on('sensor:reading', (reading) => {
    console.log('New sensor reading:', reading);
    // Process reading, save to database, etc.
});

eventBus.on('alert:triggered', (alert) => {
    console.log('ALERT:', alert.message);
    // Send notification, log, etc.
});

// Emit custom events from anywhere in your app
function processSensorData(data) {
    // ... process data ...

    // Emit event
    eventBus.emit('sensor:reading', {
        sensorId: data.id,
        value: data.value,
        timestamp: new Date()
    });

    // Check for alerts
    if (data.value > threshold) {
        eventBus.emit('alert:triggered', {
            message: 'Temperature threshold exceeded',
            value: data.value,
            threshold: threshold
        });
    }
}
```

---

## Configuration

### Environment-Based Configuration

```javascript
// config/database.development.js
module.exports = {
    mysql: {
        host: 'localhost',
        port: 3306,
        user: 'dev_user',
        password: 'dev_password',
        database: 'dev_db'
    }
};

// config/database.production.js
module.exports = {
    mysql: {
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        connectionLimit: 50 // Higher for production
    }
};
```

### Using Configuration

```javascript
const configResolver = require('./App/config');

// Get all configuration
const config = configResolver.resolveAll();

console.log('Database config:', config.database);
console.log('API config:', config.api);
console.log('WebSocket config:', config.websocket);

// Get specific module config
const dbConfig = configResolver.getConfig('database');
const apiConfig = configResolver.getConfig('api');

// Override configuration
const customConfig = configResolver.resolveAll({
    api: { port: 4000 },
    database: { type: 'firestore' }
});

// Detect environment
const env = configResolver.detectEnvironment();
console.log('Running in:', env); // 'electron', 'express', 'react', etc.
```

### Using Constants

```javascript
const {
    TABLE_NAMES,
    EVENTS,
    HTTP_STATUS,
    ERROR_MESSAGES,
    DATABASE_TYPES
} = require('./App/config/constants');

// Table names - use these instead of magic strings
const users = await db.getDataByFilters(TABLE_NAMES.USERS);
const sensors = await db.postData(TABLE_NAMES.SENSOR_DATA, data);

// Event names
eventBus.on(EVENTS.DATABASE_READY, handler);
eventBus.emit(EVENTS.DATA_SAVED, data);

// HTTP status codes
res.status(HTTP_STATUS.OK).json({ success: true });
res.status(HTTP_STATUS.BAD_REQUEST).json({ error: ERROR_MESSAGES.INVALID_DATA_FORMAT });

// Database types
if (dbConfig.type === DATABASE_TYPES.MYSQL) {
    // MySQL-specific logic
}
```

---

## Best Practices

### 1. Always Use Constants

❌ **Bad:**
```javascript
await db.postData('users', data);
eventBus.emit('database:ready');
```

✅ **Good:**
```javascript
const { TABLE_NAMES, EVENTS } = require('./App/config/constants');
await db.postData(TABLE_NAMES.USERS, data);
eventBus.emit(EVENTS.DATABASE_READY);
```

### 2. Use Services Instead of Direct Database Access

❌ **Bad:**
```javascript
const result = await db.postData('sensor_data', {
    value: 25,
    sensor_id: 'temp01'
});
```

✅ **Good:**
```javascript
const dbService = new DatabaseService(db, validation);
const result = await dbService.insert(TABLE_NAMES.SENSOR_DATA, {
    value: 25,
    sensor_id: 'temp01'
}, { validate: true });
```

### 3. Handle Errors Properly

❌ **Bad:**
```javascript
const data = await db.getDataByFilters('users');
```

✅ **Good:**
```javascript
try {
    const data = await dbService.find(TABLE_NAMES.USERS);
    return { success: true, data };
} catch (error) {
    logger.error('Failed to fetch users', { error: error.message });
    return { success: false, error: error.message };
}
```

### 4. Use EventBus for Decoupling

❌ **Bad:**
```javascript
// In module A
const moduleB = require('./moduleB');
moduleB.notify(data);
```

✅ **Good:**
```javascript
// In module A
eventBus.emit('data:processed', data);

// In module B
eventBus.on('data:processed', (data) => {
    // Handle data
});
```

### 5. Validate Before Saving

❌ **Bad:**
```javascript
await db.postData('users', userData);
```

✅ **Good:**
```javascript
const validationResult = validation.validateTableData('users', userData);
if (!validationResult.valid) {
    throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
}
await dbService.insert(TABLE_NAMES.USERS, userData);
```

### 6. Use Structured Logging

❌ **Bad:**
```javascript
console.log('User logged in: ' + userId);
```

✅ **Good:**
```javascript
logger.info('User logged in', {
    userId: userId,
    timestamp: new Date(),
    ipAddress: req.ip
});
```

### 7. Implement Graceful Shutdown

```javascript
// Catch termination signals
const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

signals.forEach(signal => {
    process.on(signal, async () => {
        logger.info(`Received ${signal}, shutting down gracefully`);

        try {
            await bootstrap.shutdown({ timeout: 30000 });
            logger.info('Shutdown complete');
            process.exit(0);
        } catch (error) {
            logger.error('Shutdown error', { error: error.message });
            process.exit(1);
        }
    });
});
```

---

## API Reference

### Bootstrap

```javascript
const bootstrap = require('./App/bootstrap');

// Initialize framework
await bootstrap.bootstrap(options);

// Options:
{
    mode: 'standalone' | 'electron' | 'express' | 'serverless',
    modules: {
        database: boolean,
        api: boolean,
        websocket: boolean,
        serial: boolean,
        ipc: boolean,
        window: boolean
    },
    config: {} // Optional config overrides
}

// Get module
const dbManager = bootstrap.getModule('database');
const apiServer = bootstrap.getModule('api');

// Event handling
bootstrap.on(eventName, handler);
bootstrap.once(eventName, handler);
bootstrap.off(eventName, handler);

// Get EventBus
const eventBus = bootstrap.getEventBus();

// Shutdown
await bootstrap.shutdown({ timeout: 30000, force: false });

// Status checks
bootstrap.isReady(); // boolean
bootstrap.getMode(); // string
```

### DatabaseService

```javascript
const dbService = new DatabaseService(dbAdapter, validationService);

// Insert
await dbService.insert(tableName, data, { validate: true, emit: true });

// Find
await dbService.find(tableName, filters, options);

// Find by ID
await dbService.findById(tableName, id);

// Update
await dbService.update(tableName, data, whereClause, whereParams);

// Delete
await dbService.delete(tableName, whereClause, whereParams);

// Count
await dbService.count(tableName, filters);

// Transaction
await dbService.transaction(async (db) => {
    await db.postData('table1', data1);
    await db.postData('table2', data2);
});

// Subscribe (Firestore only)
const { unsubscribe } = dbService.subscribe(tableName, callback, filters);

// Health check
await dbService.healthCheck();

// Get underlying adapter
const adapter = dbService.getAdapter();
```

### ValidationService

```javascript
const validation = getValidation();

// Validate against schema
validation.validate(data, schema);

// Validate single field
validation.validateField(value, rules, fieldName);

// Table-specific validation
validation.validateTableData(tableName, data);

// Validators
validation.isValidEmail(email);
validation.isNumeric(value);
validation.isAlphanumeric(value);
validation.isAlpha(value);

// Register schema
validation.registerTableSchema(tableName, schema);

// Register custom validator
validation.registerCustomValidator(name, validatorFunction);

// Validate required fields
validation.validateRequiredFields(data, ['field1', 'field2']);
```

### LoggingService

```javascript
const logger = getLogger(options);

// Log methods
logger.error(message, meta);
logger.warn(message, meta);
logger.info(message, meta);
logger.debug(message, meta);
logger.trace(message, meta);

// Configuration
logger.setLevel('debug');
logger.setConsoleLogging(true);
logger.setFileLogging(true);

// Child logger
const childLogger = logger.child({ context: 'value' });

// Get level
logger.getLevel(); // 'info', 'debug', etc.
```

### EventBus

```javascript
const eventBus = getEventBus();

// Subscribe
eventBus.on(eventName, handler, options);
eventBus.once(eventName, handler);

// Publish
eventBus.emit(eventName, ...args);

// Unsubscribe
eventBus.off(eventName, handlerOrId);
eventBus.removeAllListeners(eventName);

// Async waiting
await eventBus.waitFor(eventName, timeout);

// Namespaces
const ns = eventBus.namespace('prefix');
ns.on('event', handler);
ns.emit('event', data);

// Debugging
eventBus.getStats();
eventBus.getEventHistory(limit);
eventBus.getSubscriptions(eventName);
eventBus.getListenerCount(eventName);

// Cleanup
eventBus.destroy();
```

---

## Examples

### Complete CRUD API

```javascript
// api-example.js
const express = require('express');
const bootstrap = require('./App/bootstrap');
const DatabaseService = require('./App/modules/lib/services/DatabaseService');
const { getInstance: getValidation } = require('./App/modules/lib/services/ValidationService');
const { getInstance: getLogger } = require('./App/modules/lib/services/LoggingService');
const { TABLE_NAMES, HTTP_STATUS } = require('./App/config/constants');

const app = express();
app.use(express.json());

let dbService, logger;

// Initialize
bootstrap.bootstrap({ mode: 'express', modules: { database: true } })
    .then(() => {
        const dbManager = bootstrap.getModule('database');
        const db = dbManager.getDatabase();
        const validation = getValidation();

        dbService = new DatabaseService(db, validation);
        logger = getLogger();

        logger.info('API initialized');
    });

// CREATE
app.post('/api/sensors', async (req, res) => {
    try {
        const result = await dbService.insert(
            TABLE_NAMES.SENSORS,
            req.body,
            { validate: true }
        );

        logger.info('Sensor created', { id: result.data.insertId });
        res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
        logger.error('Failed to create sensor', { error: error.message });
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: error.message
        });
    }
});

// READ ALL
app.get('/api/sensors', async (req, res) => {
    try {
        const { limit = 50, status } = req.query;
        const filters = status ? { status } : {};

        const sensors = await dbService.find(
            TABLE_NAMES.SENSORS,
            filters,
            { limit: parseInt(limit) }
        );

        res.json({ success: true, data: sensors });
    } catch (error) {
        logger.error('Failed to fetch sensors', { error: error.message });
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message
        });
    }
});

// READ ONE
app.get('/api/sensors/:id', async (req, res) => {
    try {
        const sensor = await dbService.findById(TABLE_NAMES.SENSORS, req.params.id);

        if (!sensor) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                error: 'Sensor not found'
            });
        }

        res.json({ success: true, data: sensor });
    } catch (error) {
        logger.error('Failed to fetch sensor', { error: error.message });
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message
        });
    }
});

// UPDATE
app.put('/api/sensors/:id', async (req, res) => {
    try {
        await dbService.update(
            TABLE_NAMES.SENSORS,
            req.body,
            'id = ?',
            [req.params.id]
        );

        logger.info('Sensor updated', { id: req.params.id });
        res.json({ success: true, message: 'Sensor updated' });
    } catch (error) {
        logger.error('Failed to update sensor', { error: error.message });
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE
app.delete('/api/sensors/:id', async (req, res) => {
    try {
        await dbService.delete(TABLE_NAMES.SENSORS, 'id = ?', [req.params.id]);

        logger.info('Sensor deleted', { id: req.params.id });
        res.json({ success: true, message: 'Sensor deleted' });
    } catch (error) {
        logger.error('Failed to delete sensor', { error: error.message });
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
app.get('/health', async (req, res) => {
    const health = await dbService.healthCheck();
    res.json(health);
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
    logger.info(`API server listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down');
    await bootstrap.shutdown();
    process.exit(0);
});
```

---

## Troubleshooting

### Common Issues

**Issue: "Encryption key must be provided"**
```bash
# Solution: Set DB_ENCRYPTION_KEY in .env
DB_ENCRYPTION_KEY=your-32-character-key-here!!!!!
```

**Issue: "Database not initialized"**
```javascript
// Solution: Ensure database module is enabled
await bootstrap.bootstrap({
    modules: { database: true } // Must be true
});
```

**Issue: Events not firing**
```javascript
// Solution: Subscribe before emitting
const eventBus = bootstrap.getEventBus();
eventBus.on('my:event', handler); // Subscribe first
eventBus.emit('my:event', data);  // Then emit
```

**Issue: Validation always passes**
```javascript
// Solution: Register schema or pass rules
validation.registerTableSchema('sensors', {
    value: { required: true, numeric: true }
});
// OR
validation.validate(data, { value: { required: true } });
```

---

## Support

For issues, questions, or contributions:
- GitHub: [Your Repository URL]
- Documentation: `FRAMEWORK_REVISION_SUMMARY.md`
- Verification: Run `node verify_all.js`

---

## License

[Your License Here]
