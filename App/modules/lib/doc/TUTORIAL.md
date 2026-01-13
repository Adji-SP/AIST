# AIST Monitor Framework - Complete Tutorial

A step-by-step guide to implementing the AIST Monitor Framework in your frontend and backend applications.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Working with Services](#working-with-services)
5. [Real-World Examples](#real-world-examples)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What You'll Build

By the end of this tutorial, you'll have:
- ✅ A fully functional backend with database, API, and WebSocket support
- ✅ A React frontend that communicates with the backend
- ✅ Real-time data updates using WebSocket
- ✅ Proper error handling and validation
- ✅ Structured logging and event tracking

### Prerequisites

- Node.js 14+ installed
- Basic knowledge of JavaScript/TypeScript
- Understanding of async/await
- Familiarity with React (for frontend sections)

### Installation

```bash
# 1. Clone or navigate to the project
cd TA_PROTOTYPE

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
```

### Environment Setup

Edit your `.env` file:

```bash
# REQUIRED: 32-character encryption key
DB_ENCRYPTION_KEY=my-super-secret-key-32-chars!!

# Database Configuration
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=monitor_db

# API Configuration
API_PORT=3001
API_HOST=localhost

# WebSocket Configuration (optional)
WEBSOCKET_PORT=8080
WEBSOCKET_ENABLE_AUTH=false

# Logging
LOG_LEVEL=info
```

---

## Backend Implementation

### Tutorial 1: Basic Standalone Server

Let's create a simple standalone server that runs the framework.

**Step 1:** Create `server.js`

```javascript
// server.js
const bootstrap = require('./App/bootstrap');

async function startServer() {
    try {
        console.log('🚀 Starting AIST Monitor Framework...\n');

        // Initialize the framework
        await bootstrap.bootstrap({
            mode: 'standalone',
            modules: {
                database: true,  // Enable database
                api: true,       // Enable REST API
                websocket: false,
                serial: false,
                ipc: false
            }
        });

        console.log('\n✅ Server started successfully!');
        console.log(`📡 API available at http://localhost:${process.env.API_PORT || 3001}`);

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await bootstrap.shutdown({ timeout: 10000 });
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await bootstrap.shutdown({ timeout: 10000 });
    process.exit(0);
});
```

**Step 2:** Run the server

```bash
node server.js
```

You should see:
```
🚀 Starting AIST Monitor Framework...
[Bootstrap] Resolving configurations...
[Bootstrap] Initializing backend in standalone mode...
[Bootstrap] Initializing encryption service...
[Bootstrap] Initializing database...
✅ MySQL database connected
[Bootstrap] Initializing API server...
✅ API server started on port 3001

✅ Server started successfully!
📡 API available at http://localhost:3001
```

**Step 3:** Test the API

Open your browser or use curl:
```bash
curl http://localhost:3001/api/health
```

You should get:
```json
{
    "success": true,
    "message": "API server is running",
    "timestamp": "2024-01-13T10:30:00.000Z"
}
```

Congratulations! 🎉 Your backend is running!

---

### Tutorial 2: Using Database Service

Now let's add database operations using the DatabaseService.

**Step 1:** Create `database-example.js`

```javascript
// database-example.js
const bootstrap = require('./App/bootstrap');
const DatabaseService = require('./App/modules/lib/services/DatabaseService');
const { TABLE_NAMES } = require('./App/config/constants');
const { getInstance: getLogger } = require('./App/modules/lib/services/LoggingService');

async function main() {
    // Initialize framework
    await bootstrap.bootstrap({
        mode: 'standalone',
        modules: { database: true, api: false }
    });

    // Get services
    const dbManager = bootstrap.getModule('database');
    const dbAdapter = dbManager.getDatabase();
    const logger = getLogger({ enableConsole: true, enableFile: false });

    // Create DatabaseService
    const dbService = new DatabaseService(dbAdapter);

    logger.info('DatabaseService initialized');

    // Example 1: Insert data
    try {
        const result = await dbService.insert(TABLE_NAMES.SENSOR_DATA, {
            sensor_id: 'temp_sensor_01',
            value: 23.5,
            unit: 'celsius',
            timestamp: new Date()
        });

        logger.info('Data inserted successfully', { id: result.data.insertId });
    } catch (error) {
        logger.error('Failed to insert data', { error: error.message });
    }

    // Example 2: Find records
    try {
        const sensors = await dbService.find(TABLE_NAMES.SENSOR_DATA, {}, {
            limit: 10,
            orderBy: 'timestamp DESC'
        });

        logger.info(`Found ${sensors.length} sensor records`);
        console.log('\nRecent sensor data:');
        sensors.forEach(sensor => {
            console.log(`  - ${sensor.sensor_id}: ${sensor.value} ${sensor.unit}`);
        });
    } catch (error) {
        logger.error('Failed to fetch data', { error: error.message });
    }

    // Example 3: Count records
    try {
        const count = await dbService.count(TABLE_NAMES.SENSOR_DATA);
        logger.info(`Total sensor records: ${count}`);
    } catch (error) {
        logger.error('Failed to count data', { error: error.message });
    }

    // Cleanup
    await bootstrap.shutdown();
    process.exit(0);
}

main();
```

**Step 2:** Run the example

```bash
node database-example.js
```

---

### Tutorial 3: Express.js Integration

Let's create a full REST API using Express.js.

**Step 1:** Install Express (if not already installed)

```bash
npm install express cors body-parser
```

**Step 2:** Create `express-server.js`

```javascript
// express-server.js
const express = require('express');
const cors = require('cors');
const bootstrap = require('./App/bootstrap');
const DatabaseService = require('./App/modules/lib/services/DatabaseService');
const { getInstance: getValidation } = require('./App/modules/lib/services/ValidationService');
const { getInstance: getLogger } = require('./App/modules/lib/services/LoggingService');
const { TABLE_NAMES, HTTP_STATUS, ERROR_MESSAGES } = require('./App/config/constants');

const app = express();
let dbService, logger;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    logger && logger.info('Request received', {
        method: req.method,
        path: req.path,
        ip: req.ip
    });
    next();
});

// Initialize framework
async function initialize() {
    await bootstrap.bootstrap({
        mode: 'express',
        modules: { database: true, api: false } // We use Express directly
    });

    const dbManager = bootstrap.getModule('database');
    const validation = getValidation();
    logger = getLogger();

    dbService = new DatabaseService(dbManager.getDatabase(), validation);

    logger.info('Express server initialized');
}

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Get all sensors
app.get('/api/sensors', async (req, res) => {
    try {
        const { limit = 50, status } = req.query;
        const filters = status ? { status } : {};

        const sensors = await dbService.find(
            TABLE_NAMES.SENSORS,
            filters,
            { limit: parseInt(limit) }
        );

        res.json({ success: true, data: sensors, count: sensors.length });
    } catch (error) {
        logger.error('GET /api/sensors failed', { error: error.message });
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message
        });
    }
});

// Get sensor by ID
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
        logger.error('GET /api/sensors/:id failed', { error: error.message });
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message
        });
    }
});

// Create new sensor
app.post('/api/sensors', async (req, res) => {
    try {
        const result = await dbService.insert(
            TABLE_NAMES.SENSORS,
            req.body,
            { validate: true } // Enable validation
        );

        logger.info('Sensor created', { id: result.data.insertId });
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: { id: result.data.insertId },
            message: 'Sensor created successfully'
        });
    } catch (error) {
        logger.error('POST /api/sensors failed', { error: error.message });
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: error.message
        });
    }
});

// Update sensor
app.put('/api/sensors/:id', async (req, res) => {
    try {
        await dbService.update(
            TABLE_NAMES.SENSORS,
            req.body,
            'id = ?',
            [req.params.id]
        );

        logger.info('Sensor updated', { id: req.params.id });
        res.json({
            success: true,
            message: 'Sensor updated successfully'
        });
    } catch (error) {
        logger.error('PUT /api/sensors/:id failed', { error: error.message });
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: error.message
        });
    }
});

// Delete sensor
app.delete('/api/sensors/:id', async (req, res) => {
    try {
        await dbService.delete(TABLE_NAMES.SENSORS, 'id = ?', [req.params.id]);

        logger.info('Sensor deleted', { id: req.params.id });
        res.json({
            success: true,
            message: 'Sensor deleted successfully'
        });
    } catch (error) {
        logger.error('DELETE /api/sensors/:id failed', { error: error.message });
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message
        });
    }
});

// Get sensor data (readings)
app.get('/api/sensor-data', async (req, res) => {
    try {
        const { sensor_id, limit = 100 } = req.query;
        const filters = sensor_id ? { sensor_id } : {};

        const data = await dbService.find(
            TABLE_NAMES.SENSOR_DATA,
            filters,
            { limit: parseInt(limit), orderBy: 'timestamp DESC' }
        );

        res.json({ success: true, data, count: data.length });
    } catch (error) {
        logger.error('GET /api/sensor-data failed', { error: error.message });
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message
        });
    }
});

// Post sensor data (new reading)
app.post('/api/sensor-data', async (req, res) => {
    try {
        const result = await dbService.insert(
            TABLE_NAMES.SENSOR_DATA,
            {
                ...req.body,
                timestamp: new Date()
            },
            { validate: true }
        );

        logger.info('Sensor data saved', { id: result.data.insertId });
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: { id: result.data.insertId }
        });
    } catch (error) {
        logger.error('POST /api/sensor-data failed', { error: error.message });
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: error.message
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    logger && logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
const PORT = process.env.API_PORT || 3000;

initialize()
    .then(() => {
        app.listen(PORT, () => {
            logger.info(`Express server listening on port ${PORT}`);
            console.log(`\n✅ Server running on http://localhost:${PORT}`);
            console.log(`📡 API endpoints:`);
            console.log(`   GET    /health`);
            console.log(`   GET    /api/sensors`);
            console.log(`   POST   /api/sensors`);
            console.log(`   GET    /api/sensors/:id`);
            console.log(`   PUT    /api/sensors/:id`);
            console.log(`   DELETE /api/sensors/:id`);
            console.log(`   GET    /api/sensor-data`);
            console.log(`   POST   /api/sensor-data\n`);
        });
    })
    .catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down');
    await bootstrap.shutdown();
    process.exit(0);
});
```

**Step 3:** Run the Express server

```bash
node express-server.js
```

**Step 4:** Test the API

```bash
# Health check
curl http://localhost:3000/health

# Get all sensors
curl http://localhost:3000/api/sensors

# Create a sensor
curl -X POST http://localhost:3000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{"sensor_id":"temp_01","name":"Temperature Sensor 1","status":"active"}'

# Post sensor data
curl -X POST http://localhost:3000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"sensor_id":"temp_01","value":23.5,"unit":"celsius"}'

# Get sensor data
curl http://localhost:3000/api/sensor-data?sensor_id=temp_01
```

---

## Frontend Implementation

### Tutorial 4: React Application with Unified Service Layer

**IMPORTANT:** The correct way to integrate React with the backend is through a **unified service layer** that:
- ✅ Uses IPC in Electron mode (leverages backend services: encryption, validation, logging)
- ✅ Uses REST API in standalone mode
- ✅ Provides a consistent interface regardless of mode
- ✅ Benefits from all backend services (DatabaseService, EventBus, LoggingService)

#### Architecture Overview

```
React Components
    ↓
React Hooks (useData, useSensorData)
    ↓
Service Layer (dataService.js)
    ↓
IPC (Electron) OR REST API (Standalone)
    ↓
Backend Services
    ├─ DatabaseService (automatic encryption)
    ├─ ValidationService (automatic validation)
    ├─ EventBus (automatic events)
    └─ LoggingService (structured logging)
    ↓
MySQL Database
```

---

### Step 1: Create the Service Layer

#### 1.1 Create IPC Service (`src/services/ipc.js`)

```javascript
// src/services/ipc.js
// IPC Service - Wraps Electron IPC calls (window.api from preload.js)

class IpcService {
    constructor() {
        this.ipc = window.api;
        this.isElectron = !!window.api;
    }

    /**
     * Check if running in Electron
     */
    isAvailable() {
        return this.isElectron;
    }

    /**
     * Generic IPC invoke
     */
    async invoke(channel, ...args) {
        if (!this.isElectron) {
            throw new Error('IPC is only available in Electron mode');
        }
        return await this.ipc.invoke(channel, ...args);
    }

    // === Database Operations ===

    async getDataByFilters(table, filters = {}, options = {}) {
        return await this.ipc.getDataByFilters(table, filters, options);
    }

    async insertData(table, data) {
        return await this.ipc.insertData(table, data);
    }

    async updateData(table, data, whereClause, whereParams) {
        return await this.ipc.updateData(table, data, whereClause, whereParams);
    }

    async deleteData(table, whereClause, whereParams) {
        return await this.ipc.deleteData(table, whereClause, whereParams);
    }

    // === Serial Operations ===

    async getSerialStatus() {
        return await this.invoke('serial-get-status');
    }

    async serialForceReconnect() {
        return await this.invoke('serial-force-reconnect');
    }

    async serialDisconnect() {
        return await this.invoke('serial-disconnect');
    }

    async serialSendData(data) {
        return await this.invoke('serial-send-data', data);
    }

    // === Database Health ===

    async checkDatabaseConnection() {
        return await this.invoke('check-database-connection');
    }

    async getDatabaseConfig() {
        return await this.invoke('db-get-config');
    }

    async getDatabaseHealth() {
        return await this.invoke('db-health-check');
    }

    // === Sensor Data (monitoring specific) ===

    async getTemperatureData(limit = 50) {
        return await this.invoke('get-temperature-data', limit);
    }

    async getPressureData(limit = 50) {
        return await this.invoke('get-pressure-data', limit);
    }

    async getRecordCount(type) {
        return await this.invoke('get-record-count', type);
    }

    async insertTemperatureData(data) {
        return await this.invoke('insert-temperature-data', data);
    }

    async insertPressureData(data) {
        return await this.invoke('insert-pressure-data', data);
    }
}

export default new IpcService();
```

#### 1.2 Create API Service (`src/services/api.js`)

```javascript
// src/services/api.js
// REST API Service - For standalone mode (no Electron)

class ApiService {
    constructor() {
        this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    }

    async _fetch(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // === Database Operations ===

    async getDataByFilters(table, filters = {}, options = {}) {
        return await this._fetch('/api/data/query', {
            method: 'POST',
            body: JSON.stringify({ table, filters, options })
        });
    }

    async insertData(table, data) {
        return await this._fetch('/api/data/insert', {
            method: 'POST',
            body: JSON.stringify({ table, data })
        });
    }

    async updateData(table, data, whereClause, whereParams) {
        return await this._fetch('/api/data/update', {
            method: 'PUT',
            body: JSON.stringify({ table, data, whereClause, whereParams })
        });
    }

    async deleteData(table, whereClause, whereParams) {
        return await this._fetch('/api/data/delete', {
            method: 'DELETE',
            body: JSON.stringify({ table, whereClause, whereParams })
        });
    }

    // === Sensor Data ===

    async getSensorData(filters = {}) {
        return await this._fetch('/api/sensor-data', {
            method: 'GET',
            params: filters
        });
    }

    async insertSensorData(data) {
        return await this._fetch('/api/sensor-data', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // === Health Check ===

    async healthCheck() {
        return await this._fetch('/api/health');
    }
}

export default new ApiService();
```

#### 1.3 Create Unified Data Service (`src/services/dataService.js`)

```javascript
// src/services/dataService.js
// Unified Data Service - Mode-aware data access layer

import ipcService from './ipc';
import apiService from './api';

class DataService {
    constructor() {
        // Auto-detect mode
        this.mode = this._detectMode();
        console.log(`📡 DataService initialized in ${this.mode} mode`);
    }

    _detectMode() {
        // Check if running in Electron
        if (ipcService.isAvailable()) {
            return 'electron';
        }
        // Otherwise, use REST API
        return 'api';
    }

    /**
     * Get the appropriate service based on mode
     */
    _getService() {
        return this.mode === 'electron' ? ipcService : apiService;
    }

    // === Database Operations ===

    /**
     * Get data by filters
     * @param {string} table - Table name
     * @param {object} filters - Filter conditions
     * @param {object} options - Query options (limit, orderBy, etc.)
     */
    async getDataByFilters(table, filters = {}, options = {}) {
        const service = this._getService();
        const result = await service.getDataByFilters(table, filters, options);

        // Handle response format differences
        if (result.success !== undefined) {
            return result.success ? result.data : [];
        }
        return result;
    }

    /**
     * Insert data into table
     * Benefits from backend DatabaseService:
     * - Automatic encryption for sensitive fields
     * - Automatic validation
     * - Automatic event emission (EventBus)
     */
    async insertData(table, data) {
        const service = this._getService();
        return await service.insertData(table, data);
    }

    /**
     * Update data in table
     */
    async updateData(table, data, whereClause, whereParams) {
        const service = this._getService();
        return await service.updateData(table, data, whereClause, whereParams);
    }

    /**
     * Delete data from table
     */
    async deleteData(table, whereClause, whereParams) {
        const service = this._getService();
        return await service.deleteData(table, whereClause, whereParams);
    }

    // === Sensor Data (convenience methods) ===

    async getSensorData(filters = {}) {
        return await this.getDataByFilters('sensor_data', filters, {
            orderBy: 'timestamp',
            orderDirection: 'DESC'
        });
    }

    async insertSensorData(data) {
        return await this.insertData('sensor_data', {
            ...data,
            timestamp: new Date().toISOString()
        });
    }

    // === Serial Operations (Electron only) ===

    async getSerialStatus() {
        if (this.mode !== 'electron') {
            throw new Error('Serial operations only available in Electron mode');
        }
        return await ipcService.getSerialStatus();
    }

    async serialForceReconnect() {
        if (this.mode !== 'electron') {
            throw new Error('Serial operations only available in Electron mode');
        }
        return await ipcService.serialForceReconnect();
    }

    // === Database Health ===

    async checkDatabaseConnection() {
        if (this.mode === 'electron') {
            return await ipcService.checkDatabaseConnection();
        } else {
            try {
                await apiService.healthCheck();
                return true;
            } catch {
                return false;
            }
        }
    }

    // === Mode Info ===

    getMode() {
        return this.mode;
    }

    isElectronMode() {
        return this.mode === 'electron';
    }
}

export default new DataService();
```

---

### Step 2: Create React Hooks

#### 2.1 Create Data Hook (`src/hook/useData.js`)

```javascript
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
```

---

### Step 3: Create React Components

#### 3.1 Sensor List Component (`src/components/SensorList.jsx`)

```jsx
// src/components/SensorList.jsx
import React, { useState } from 'react';
import { useData, useInsertData } from '../hook/useData';

function SensorList() {
    const [newSensor, setNewSensor] = useState({
        sensor_id: '',
        name: '',
        status: 'active'
    });

    // Use the unified data hook - works in both Electron and Standalone mode!
    const { data: sensors, loading, error, refetch } = useData('sensors', {}, { limit: 100 });
    const { insertData, loading: inserting } = useInsertData();

    const handleCreateSensor = async (e) => {
        e.preventDefault();

        try {
            await insertData('sensors', newSensor);
            alert('✅ Sensor created successfully!');
            setNewSensor({ sensor_id: '', name: '', status: 'active' });
            refetch(); // Refresh list
        } catch (err) {
            alert('❌ Failed to create sensor: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading sensors...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                    <p className="text-red-600">{error.message}</p>
                    <button
                        onClick={refetch}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Sensor Management</h1>

            {/* Create New Sensor Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Create New Sensor</h2>
                <form onSubmit={handleCreateSensor} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Sensor ID (e.g., temp_01)"
                        value={newSensor.sensor_id}
                        onChange={(e) => setNewSensor({...newSensor, sensor_id: e.target.value})}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Sensor Name"
                        value={newSensor.name}
                        onChange={(e) => setNewSensor({...newSensor, name: e.target.value})}
                        required
                        className="flex-1 px-4 py-2 border border-gray-300 rounded"
                    />
                    <select
                        value={newSensor.status}
                        onChange={(e) => setNewSensor({...newSensor, status: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                    <button
                        type="submit"
                        disabled={inserting}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {inserting ? 'Creating...' : 'Create Sensor'}
                    </button>
                </form>
            </div>

            {/* Sensor List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">All Sensors ({sensors.length})</h2>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        🔄 Refresh
                    </button>
                </div>

                {sensors.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No sensors found. Create one above!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sensors.map((sensor) => (
                            <div key={sensor.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-lg">{sensor.name || sensor.sensor_id}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        sensor.status === 'active' ? 'bg-green-100 text-green-800' :
                                        sensor.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {sensor.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>ID:</strong> {sensor.sensor_id}</p>
                                    {sensor.created_at && (
                                        <p><strong>Created:</strong> {new Date(sensor.created_at).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SensorList;
```

**Key Benefits:**
- ✅ Works in both Electron and Standalone mode automatically
- ✅ Uses backend DatabaseService (automatic encryption, validation)
- ✅ Backend EventBus emits events automatically
- ✅ Backend LoggingService logs all operations
- ✅ Clean, reusable hooks
- ✅ Modern Tailwind CSS styling

---

#### 3.2 Serial Status Component (Electron Only)

```jsx
// src/components/SerialStatus.jsx
import React from 'react';
import { useSerialStatus } from '../hook/useData';
import dataService from '../services/dataService';

function SerialStatus() {
    const { status, loading, error, refetch, reconnect } = useSerialStatus();

    // Only show in Electron mode
    if (!dataService.isElectronMode()) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">Serial connection is only available in Electron mode.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Serial Connection</h2>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-red-600">Serial Connection Error</h2>
                <p className="text-red-600 mb-4">{error.message}</p>
                <button
                    onClick={refetch}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Serial Connection</h2>
                <div className="flex gap-2">
                    <button
                        onClick={refetch}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                    >
                        🔄 Refresh
                    </button>
                    {status && !status.connected && (
                        <button
                            onClick={reconnect}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                            🔌 Reconnect
                        </button>
                    )}
                </div>
            </div>

            {status ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-semibold">
                            {status.connected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>

                    {status.port && (
                        <div className="text-sm space-y-1">
                            <p><strong>Port:</strong> {status.port}</p>
                            <p><strong>Baud Rate:</strong> {status.baudRate || 'N/A'}</p>
                            {status.lastData && (
                                <p><strong>Last Data:</strong> {new Date(status.lastData).toLocaleString()}</p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-gray-500">No serial status available</p>
            )}
        </div>
    );
}

export default SerialStatus;
```

---

#### 3.3 Dashboard Component (Complete Example)

```jsx
// src/components/Dashboard.jsx
import React from 'react';
import { useSensorData, useSerialStatus } from '../hook/useData';
import dataService from '../services/dataService';
import SerialStatus from './SerialStatus';

function Dashboard() {
    // Fetch latest sensor data
    const { data: sensorData, loading, error, refetch } = useSensorData({}, { limit: 10 });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">AIST Monitor Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {dataService.getMode().toUpperCase()} MODE
                        </span>
                        <button
                            onClick={refetch}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            🔄 Refresh Data
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Serial Status (Electron only) */}
                    {dataService.isElectronMode() && (
                        <div className="lg:col-span-1">
                            <SerialStatus />
                        </div>
                    )}

                    {/* Recent Sensor Data */}
                    <div className={dataService.isElectronMode() ? 'lg:col-span-2' : 'lg:col-span-3'}>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Recent Sensor Data</h2>

                            {loading && (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Loading data...</p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded p-4 text-red-600">
                                    Error loading data: {error.message}
                                </div>
                            )}

                            {!loading && !error && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 px-4">Time</th>
                                                <th className="text-left py-2 px-4">Sensor ID</th>
                                                <th className="text-left py-2 px-4">Value</th>
                                                <th className="text-left py-2 px-4">Unit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sensorData.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-8 text-gray-500">
                                                        No sensor data available
                                                    </td>
                                                </tr>
                                            ) : (
                                                sensorData.map((reading, idx) => (
                                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                                        <td className="py-2 px-4 text-sm">
                                                            {new Date(reading.timestamp).toLocaleTimeString()}
                                                        </td>
                                                        <td className="py-2 px-4 font-medium">{reading.sensor_id}</td>
                                                        <td className="py-2 px-4">{reading.value}</td>
                                                        <td className="py-2 px-4 text-gray-600">{reading.unit}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
```

---

### Step 4: Update App Component

```jsx
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SensorList from './components/SensorList';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/sensors" element={<SensorList />} />
            </Routes>
        </Router>
    );
}

export default App;
```

---

### Step 5: Run Your Application

#### Electron Mode (with IPC):

```bash
# Start the backend
npm run electron

# The React app will use IPC automatically!
# Benefits: Encryption, Validation, Events, Logging
```

#### Standalone Mode (REST API):

```bash
# Terminal 1: Start backend API server
node server.js  # or express-server.js

# Terminal 2: Start React app
npm start

# The React app will use REST API automatically!
```

---

## Summary: Frontend Integration

### What You've Built ✅

1. **Service Layer** (`src/services/`)
   - `ipc.js` - Electron IPC wrapper
   - `api.js` - REST API client
   - `dataService.js` - Unified, mode-aware data service

2. **React Hooks** (`src/hook/`)
   - `useData` - Fetch data from any table
   - `useInsertData` - Insert data with loading states
   - `useSensorData` - Convenience hook for sensor data
   - `useSerialStatus` - Monitor serial connection (Electron only)

3. **React Components**
   - `SensorList.jsx` - CRUD operations for sensors
   - `SerialStatus.jsx` - Serial connection monitoring
   - `Dashboard.jsx` - Complete dashboard with real-time data

### Key Benefits ✅

- **Mode-Aware**: Automatically uses IPC (Electron) or REST API (Standalone)
- **Backend Services**: All data goes through backend (encryption, validation, logging, events)
- **Clean Architecture**: Service layer abstracts communication method
- **Reusable Hooks**: Easy to add new components
- **Type-Safe**: Consistent interface across modes
- **Error Handling**: Built-in error states and loading states

---

## Migrating Existing Components

If you have existing React components using Firestore directly:

### Before (Firestore Direct Access):

```jsx
import { useFirestore } from './hook/useFirestoreClean';

function MyComponent() {
    const { data, loading, error } = useFirestore('sensors', { limit: 50 });
    // Data bypasses backend services!
}
```

### After (Unified Service Layer):

```jsx
import { useData } from './hook/useData';

function MyComponent() {
    const { data, loading, error } = useData('sensors', {}, { limit: 50 });
    // Data flows through backend: encryption, validation, events, logging!
}
```

### Migration Steps:

1. **Replace imports**:
   ```javascript
   // Old
   import { useFirestore } from './hook/useFirestoreClean';

   // New
   import { useData } from './hook/useData';
   ```

2. **Update hook calls**:
   ```javascript
   // Old
   const { data } = useFirestore('table', options);

   // New
   const { data } = useData('table', {}, options);
   ```

3. **Test both modes**:
   - Test in Electron mode (IPC)
   - Test in standalone mode (REST API)

---

###  CSS Section (Optional)

```css
/* src/components/SensorList.css */
/* NOTE: Examples above use Tailwind CSS classes inline.
   If you prefer external CSS, you can use this instead: */

.sensor-list {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.loading {
    text-align: center;
    padding: 40px;
    font-size: 18px;
}

.error {
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
}

.error button {
    margin-top: 10px;
}

.create-sensor-form {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;
}

.create-sensor-form h2 {
    margin-top: 0;
}

.create-sensor-form form {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.create-sensor-form input,
.create-sensor-form select {
    flex: 1;
    min-width: 200px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.create-sensor-form button {
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.create-sensor-form button:hover {
    background: #0056b3;
}

.sensor-grid h2 {
    margin-bottom: 20px;
}

.sensors {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.sensor-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.sensor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.sensor-header h3 {
    margin: 0;
}

.status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
}

.status.active {
    background: #d4edda;
    color: #155724;
}

.status.inactive {
    background: #f8d7da;
    color: #721c24;
}

.status.maintenance {
    background: #fff3cd;
    color: #856404;
}

.sensor-details p {
    margin: 5px 0;
    font-size: 14px;
}

.sensor-actions {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #eee;
}

.delete-btn {
    padding: 8px 16px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.delete-btn:hover {
    background: #c82333;
}

.refresh-btn {
    margin-top: 20px;
    padding: 10px 20px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.refresh-btn:hover {
    background: #218838;
}
```

**Step 4:** Use in your App (`src/App.js`)

```jsx
// src/App.js
import React from 'react';
import SensorList from './components/SensorList';
import './App.css';

function App() {
    return (
        <div className="App">
            <SensorList />
        </div>
    );
}

export default App;
```

**Step 5:** Configure environment (`.env` in React project root)

```bash
REACT_APP_API_URL=http://localhost:3000
```

**Step 6:** Run your React app

```bash
npm start
```

Your React app should now connect to the backend and allow you to create, view, and delete sensors!

---

### Tutorial 5: Real-Time Updates with WebSocket

Let's add real-time sensor data updates using WebSocket.

**Step 1:** Install Socket.IO client

```bash
npm install socket.io-client
```

**Step 2:** Create WebSocket service (`src/services/websocket.js`)

```javascript
// src/services/websocket.js
import io from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.connected = false;
    }

    connect(url = 'http://localhost:8080') {
        if (this.socket) {
            console.log('Already connected');
            return this.socket;
        }

        console.log('🔌 Connecting to WebSocket server...');

        this.socket = io(url, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
            this.connected = true;
            this.notifyListeners('connection', { status: 'connected' });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            this.connected = false;
            this.notifyListeners('connection', { status: 'disconnected', reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.notifyListeners('error', { error });
        });

        // Handle incoming data
        this.socket.on('data', (data) => {
            console.log('📨 Data received:', data);
            this.notifyListeners('data', data);
        });

        // Handle sensor data specifically
        this.socket.on('sensor:reading', (reading) => {
            console.log('📊 Sensor reading:', reading);
            this.notifyListeners('sensor:reading', reading);
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
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Listener error:', error);
            }
        });
    }

    send(event, data) {
        if (this.socket && this.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Cannot send: WebSocket not connected');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    isConnected() {
        return this.connected;
    }
}

export default new WebSocketService();
```

**Step 3:** Create live sensor monitor component (`src/components/LiveSensorMonitor.jsx`)

```jsx
// src/components/LiveSensorMonitor.jsx
import React, { useState, useEffect } from 'react';
import WebSocketService from '../services/websocket';
import './LiveSensorMonitor.css';

function LiveSensorMonitor() {
    const [liveData, setLiveData] = useState([]);
    const [connected, setConnected] = useState(false);
    const [stats, setStats] = useState({ total: 0, lastUpdate: null });

    useEffect(() => {
        // Connect to WebSocket
        WebSocketService.connect('http://localhost:8080');

        // Subscribe to connection status
        const unsubConnection = WebSocketService.subscribe('connection', (status) => {
            setConnected(status.status === 'connected');
        });

        // Subscribe to sensor readings
        const unsubData = WebSocketService.subscribe('sensor:reading', (reading) => {
            setLiveData(prev => {
                const newData = [reading, ...prev].slice(0, 50); // Keep last 50
                return newData;
            });

            setStats(prev => ({
                total: prev.total + 1,
                lastUpdate: new Date()
            }));
        });

        // Cleanup
        return () => {
            unsubConnection();
            unsubData();
            WebSocketService.disconnect();
        };
    }, []);

    const clearData = () => {
        setLiveData([]);
        setStats({ total: 0, lastUpdate: null });
    };

    return (
        <div className="live-monitor">
            <div className="monitor-header">
                <h2>Live Sensor Monitor</h2>
                <div className="status-badge">
                    <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
                    {connected ? 'Connected' : 'Disconnected'}
                </div>
            </div>

            <div className="monitor-stats">
                <div className="stat">
                    <span className="stat-label">Total Readings:</span>
                    <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Last Update:</span>
                    <span className="stat-value">
                        {stats.lastUpdate ? stats.lastUpdate.toLocaleTimeString() : 'N/A'}
                    </span>
                </div>
                <button onClick={clearData} className="clear-btn">Clear</button>
            </div>

            <div className="data-stream">
                {liveData.length === 0 ? (
                    <div className="no-data">
                        <p>Waiting for sensor data...</p>
                        {!connected && <p className="hint">Connect to WebSocket server first</p>}
                    </div>
                ) : (
                    <div className="data-list">
                        {liveData.map((data, idx) => (
                            <div key={idx} className="data-item animate-fade-in">
                                <span className="timestamp">
                                    {new Date(data.timestamp).toLocaleTimeString()}
                                </span>
                                <span className="sensor-id">{data.sensor_id}</span>
                                <span className="value">
                                    {data.value} {data.unit}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LiveSensorMonitor;
```

**Step 4:** Add CSS (`src/components/LiveSensorMonitor.css`)

```css
/* src/components/LiveSensorMonitor.css */
.live-monitor {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.monitor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #007bff;
}

.monitor-header h2 {
    margin: 0;
}

.status-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #f5f5f5;
    border-radius: 20px;
    font-weight: 500;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.status-dot.connected {
    background: #28a745;
}

.status-dot.disconnected {
    background: #dc3545;
    animation: none;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.monitor-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    align-items: center;
}

.stat {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.stat-label {
    font-size: 12px;
    color: #666;
    font-weight: 500;
}

.stat-value {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.clear-btn {
    margin-left: auto;
    padding: 8px 16px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.clear-btn:hover {
    background: #5a6268;
}

.data-stream {
    max-height: 500px;
    overflow-y: auto;
}

.no-data {
    text-align: center;
    padding: 40px;
    color: #666;
}

.no-data .hint {
    font-size: 14px;
    color: #999;
    margin-top: 10px;
}

.data-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.data-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f8f9fa;
    border-left: 4px solid #007bff;
    border-radius: 4px;
}

.data-item .timestamp {
    font-size: 12px;
    color: #666;
    min-width: 100px;
}

.data-item .sensor-id {
    font-weight: 500;
    color: #333;
    flex: 1;
}

.data-item .value {
    font-size: 16px;
    font-weight: bold;
    color: #007bff;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fadeIn 0.3s ease-out;
}
```

**Step 5:** Use in your App

```jsx
// src/App.js
import React from 'react';
import SensorList from './components/SensorList';
import LiveSensorMonitor from './components/LiveSensorMonitor';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>AIST Monitor Dashboard</h1>
            </header>
            <main className="App-main">
                <div className="container">
                    <div className="section">
                        <LiveSensorMonitor />
                    </div>
                    <div className="section">
                        <SensorList />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
```

---

## Working with Services

### Using ValidationService

```javascript
const { getInstance: getValidation } = require('./App/modules/lib/services/ValidationService');

const validation = getValidation();

// Define custom validation schema
validation.registerTableSchema('custom_table', {
    email: { required: true, email: true },
    age: { required: true, numeric: true, min: 18, max: 100 },
    username: { required: true, minLength: 3, maxLength: 20, alphanumeric: true },
    website: { required: false, pattern: /^https?:\/\/.+/ }
});

// Validate data
const data = {
    email: 'user@example.com',
    age: 25,
    username: 'john_doe',
    website: 'https://example.com'
};

const result = validation.validateTableData('custom_table', data);

if (!result.valid) {
    console.error('Validation errors:', result.errors);
} else {
    console.log('Data is valid!');
}
```

### Using LoggingService

```javascript
const { getInstance: getLogger } = require('./App/modules/lib/services/LoggingService');

const logger = getLogger({
    level: 'debug',
    enableConsole: true,
    enableFile: true,
    logFilePath: './logs/app.log',
    maxLogSize: 10 * 1024 * 1024 // 10MB
});

// Log at different levels
logger.error('Critical error', { userId: 123, action: 'payment' });
logger.warn('Warning', { resource: 'api', remaining: 10 });
logger.info('User logged in', { userId: 123, ip: '192.168.1.1' });
logger.debug('Debug info', { query: 'SELECT * FROM users' });

// Create child logger with context
const requestLogger = logger.child({
    requestId: 'abc-123',
    userId: 456
});

requestLogger.info('Processing request'); // Automatically includes requestId and userId
requestLogger.error('Request failed');
```

### Using EventBus

```javascript
const { getInstance: getEventBus } = require('./App/modules/lib/events/EventBus');

const eventBus = getEventBus();

// Subscribe to custom events
eventBus.on('sensor:alert', (alert) => {
    console.log('🚨 ALERT:', alert.message);
    // Send email, push notification, etc.
});

eventBus.on('system:maintenance', (info) => {
    console.log('🔧 Maintenance mode:', info);
    // Disable certain features
});

// Emit events from your business logic
function checkSensorThreshold(reading) {
    if (reading.value > reading.threshold) {
        eventBus.emit('sensor:alert', {
            message: `${reading.sensor_id} exceeded threshold`,
            value: reading.value,
            threshold: reading.threshold,
            timestamp: new Date()
        });
    }
}

// Use namespaced events for organization
const sensorEvents = eventBus.namespace('sensor');
sensorEvents.on('reading', (data) => console.log('Sensor reading:', data));
sensorEvents.emit('reading', { sensor_id: 'temp_01', value: 25 });
```

---

## Real-World Examples

### Example 1: Complete Sensor Monitoring System

```javascript
// sensor-monitoring-system.js
const bootstrap = require('./App/bootstrap');
const DatabaseService = require('./App/modules/lib/services/DatabaseService');
const { getInstance: getEventBus } = require('./App/modules/lib/events/EventBus');
const { getInstance: getLogger } = require('./App/modules/lib/services/LoggingService');
const { TABLE_NAMES } = require('./App/config/constants');

class SensorMonitoringSystem {
    constructor() {
        this.dbService = null;
        this.eventBus = getEventBus();
        this.logger = getLogger();
        this.thresholds = new Map();
    }

    async initialize() {
        // Initialize framework
        await bootstrap.bootstrap({
            mode: 'standalone',
            modules: { database: true, websocket: true }
        });

        // Setup services
        const dbManager = bootstrap.getModule('database');
        this.dbService = new DatabaseService(dbManager.getDatabase());

        // Load thresholds from database
        await this.loadThresholds();

        // Setup event listeners
        this.setupEventListeners();

        this.logger.info('Sensor Monitoring System initialized');
    }

    async loadThresholds() {
        try {
            const sensors = await this.dbService.find(TABLE_NAMES.SENSORS);

            sensors.forEach(sensor => {
                if (sensor.threshold_min || sensor.threshold_max) {
                    this.thresholds.set(sensor.sensor_id, {
                        min: sensor.threshold_min,
                        max: sensor.threshold_max
                    });
                }
            });

            this.logger.info(`Loaded ${this.thresholds.size} sensor thresholds`);
        } catch (error) {
            this.logger.error('Failed to load thresholds', { error: error.message });
        }
    }

    setupEventListeners() {
        // Listen for new sensor readings
        this.eventBus.on('data:saved', (event) => {
            if (event.tableName === TABLE_NAMES.SENSOR_DATA) {
                this.checkThresholds(event.data);
            }
        });

        // Listen for alerts
        this.eventBus.on('sensor:alert', (alert) => {
            this.handleAlert(alert);
        });
    }

    async processSensorReading(reading) {
        try {
            // Save reading to database
            const result = await this.dbService.insert(TABLE_NAMES.SENSOR_DATA, {
                sensor_id: reading.sensor_id,
                value: reading.value,
                unit: reading.unit || 'celsius',
                timestamp: new Date()
            });

            this.logger.info('Sensor reading saved', {
                sensor_id: reading.sensor_id,
                value: reading.value
            });

            // Check thresholds
            this.checkThresholds(reading);

            return result;
        } catch (error) {
            this.logger.error('Failed to process reading', {
                error: error.message,
                reading
            });
            throw error;
        }
    }

    checkThresholds(reading) {
        const threshold = this.thresholds.get(reading.sensor_id);

        if (!threshold) {
            return; // No threshold configured
        }

        let alertMessage = null;

        if (threshold.max && reading.value > threshold.max) {
            alertMessage = `Value ${reading.value} exceeds maximum threshold ${threshold.max}`;
        } else if (threshold.min && reading.value < threshold.min) {
            alertMessage = `Value ${reading.value} below minimum threshold ${threshold.min}`;
        }

        if (alertMessage) {
            this.eventBus.emit('sensor:alert', {
                sensor_id: reading.sensor_id,
                value: reading.value,
                threshold,
                message: alertMessage,
                severity: 'high',
                timestamp: new Date()
            });
        }
    }

    async handleAlert(alert) {
        try {
            // Log the alert
            this.logger.warn('Sensor alert triggered', alert);

            // Save alert to database
            await this.dbService.insert('sensor_alerts', {
                sensor_id: alert.sensor_id,
                message: alert.message,
                severity: alert.severity,
                value: alert.value,
                timestamp: alert.timestamp
            });

            // TODO: Send notifications (email, SMS, push)
            console.log('\n🚨 ALERT:', alert.message);
            console.log(`   Sensor: ${alert.sensor_id}`);
            console.log(`   Value: ${alert.value}`);
            console.log(`   Time: ${alert.timestamp.toLocaleString()}\n`);

        } catch (error) {
            this.logger.error('Failed to handle alert', { error: error.message });
        }
    }

    async getRecentReadings(sensorId, limit = 100) {
        return await this.dbService.find(
            TABLE_NAMES.SENSOR_DATA,
            { sensor_id: sensorId },
            { limit, orderBy: 'timestamp DESC' }
        );
    }

    async getSensorStatistics(sensorId, hours = 24) {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const readings = await this.dbService.find(
            TABLE_NAMES.SENSOR_DATA,
            { sensor_id: sensorId },
            { orderBy: 'timestamp DESC' }
        );

        const recentReadings = readings.filter(r => new Date(r.timestamp) > since);

        if (recentReadings.length === 0) {
            return null;
        }

        const values = recentReadings.map(r => r.value);
        const sum = values.reduce((a, b) => a + b, 0);

        return {
            count: recentReadings.length,
            average: sum / recentReadings.length,
            min: Math.min(...values),
            max: Math.max(...values),
            latest: recentReadings[0].value,
            timestamp: recentReadings[0].timestamp
        };
    }

    async shutdown() {
        this.logger.info('Shutting down Sensor Monitoring System');
        await bootstrap.shutdown();
    }
}

// Usage
async function main() {
    const system = new SensorMonitoringSystem();
    await system.initialize();

    // Simulate sensor readings
    setInterval(async () => {
        const reading = {
            sensor_id: 'temp_01',
            value: 20 + Math.random() * 15, // 20-35°C
            unit: 'celsius'
        };

        await system.processSensorReading(reading);
    }, 5000); // Every 5 seconds

    // Get statistics every minute
    setInterval(async () => {
        const stats = await system.getSensorStatistics('temp_01', 1);
        if (stats) {
            console.log('\n📊 Sensor Statistics (last hour):');
            console.log(`   Average: ${stats.average.toFixed(2)}°C`);
            console.log(`   Min: ${stats.min}°C`);
            console.log(`   Max: ${stats.max}°C`);
            console.log(`   Readings: ${stats.count}\n`);
        }
    }, 60000); // Every minute

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        await system.shutdown();
        process.exit(0);
    });
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SensorMonitoringSystem;
```

---

## Best Practices

### 1. Always Use Constants

```javascript
// ❌ Bad
await db.postData('users', data);
eventBus.emit('database:ready');

// ✅ Good
const { TABLE_NAMES, EVENTS } = require('./App/config/constants');
await db.postData(TABLE_NAMES.USERS, data);
eventBus.emit(EVENTS.DATABASE_READY);
```

### 2. Handle Errors Gracefully

```javascript
// ❌ Bad
const data = await dbService.find(TABLE_NAMES.SENSORS);

// ✅ Good
try {
    const data = await dbService.find(TABLE_NAMES.SENSORS);
    return { success: true, data };
} catch (error) {
    logger.error('Failed to fetch sensors', { error: error.message });
    return { success: false, error: error.message };
}
```

### 3. Use Structured Logging

```javascript
// ❌ Bad
console.log('User ' + userId + ' logged in');

// ✅ Good
logger.info('User logged in', {
    userId,
    timestamp: new Date(),
    ipAddress: req.ip
});
```

### 4. Validate Before Saving

```javascript
// ❌ Bad
await dbService.insert(TABLE_NAMES.USERS, userData);

// ✅ Good
const validation = getValidation();
const result = validation.validateTableData(TABLE_NAMES.USERS, userData);

if (!result.valid) {
    throw new Error(`Validation failed: ${result.errors.join(', ')}`);
}

await dbService.insert(TABLE_NAMES.USERS, userData, { validate: true });
```

### 5. Use EventBus for Decoupling

```javascript
// ❌ Bad - Direct coupling
const notificationService = require('./notificationService');
notificationService.sendEmail(user);

// ✅ Good - Event-driven
eventBus.emit('user:registered', { user });

// In notification module
eventBus.on('user:registered', async ({ user }) => {
    await sendWelcomeEmail(user);
});
```

---

## Common Patterns

### Pattern 1: Middleware Pattern

```javascript
// middleware/authenticate.js
const { getInstance: getLogger } = require('../App/modules/lib/services/LoggingService');

const logger = getLogger();

function authenticate(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        logger.warn('Authentication failed: No token provided', { ip: req.ip });
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    // Validate token
    try {
        // ... token validation logic ...
        req.user = decodedUser;
        next();
    } catch (error) {
        logger.error('Authentication failed', { error: error.message });
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
}

module.exports = authenticate;
```

### Pattern 2: Repository Pattern

```javascript
// repositories/SensorRepository.js
const DatabaseService = require('../App/modules/lib/services/DatabaseService');
const { TABLE_NAMES } = require('../App/config/constants');

class SensorRepository {
    constructor(dbService) {
        this.dbService = dbService;
    }

    async findAll() {
        return await this.dbService.find(TABLE_NAMES.SENSORS);
    }

    async findById(id) {
        return await this.dbService.findById(TABLE_NAMES.SENSORS, id);
    }

    async findByStatus(status) {
        return await this.dbService.find(TABLE_NAMES.SENSORS, { status });
    }

    async create(sensorData) {
        return await this.dbService.insert(
            TABLE_NAMES.SENSORS,
            sensorData,
            { validate: true }
        );
    }

    async update(id, updates) {
        return await this.dbService.update(
            TABLE_NAMES.SENSORS,
            updates,
            'id = ?',
            [id]
        );
    }

    async delete(id) {
        return await this.dbService.delete(
            TABLE_NAMES.SENSORS,
            'id = ?',
            [id]
        );
    }

    async getReadings(sensorId, limit = 100) {
        return await this.dbService.find(
            TABLE_NAMES.SENSOR_DATA,
            { sensor_id: sensorId },
            { limit, orderBy: 'timestamp DESC' }
        );
    }
}

module.exports = SensorRepository;
```

### Pattern 3: Service Layer Pattern

```javascript
// services/SensorService.js
const SensorRepository = require('../repositories/SensorRepository');
const { getInstance: getEventBus } = require('../App/modules/lib/events/EventBus');
const { getInstance: getLogger } = require('../App/modules/lib/services/LoggingService');

class SensorService {
    constructor(sensorRepository) {
        this.repository = sensorRepository;
        this.eventBus = getEventBus();
        this.logger = getLogger();
    }

    async createSensor(sensorData) {
        try {
            const result = await this.repository.create(sensorData);

            this.eventBus.emit('sensor:created', {
                id: result.data.insertId,
                sensor_id: sensorData.sensor_id
            });

            this.logger.info('Sensor created', { sensor_id: sensorData.sensor_id });

            return result;
        } catch (error) {
            this.logger.error('Failed to create sensor', {
                error: error.message,
                sensorData
            });
            throw error;
        }
    }

    async getSensorWithStatistics(sensorId) {
        try {
            const sensor = await this.repository.findById(sensorId);

            if (!sensor) {
                return null;
            }

            const readings = await this.repository.getReadings(sensor.sensor_id, 100);

            const statistics = this.calculateStatistics(readings);

            return {
                ...sensor,
                statistics,
                recentReadings: readings.slice(0, 10)
            };
        } catch (error) {
            this.logger.error('Failed to get sensor with statistics', {
                error: error.message,
                sensorId
            });
            throw error;
        }
    }

    calculateStatistics(readings) {
        if (readings.length === 0) {
            return null;
        }

        const values = readings.map(r => r.value);
        const sum = values.reduce((a, b) => a + b, 0);

        return {
            count: readings.length,
            average: sum / readings.length,
            min: Math.min(...values),
            max: Math.max(...values),
            latest: values[0]
        };
    }
}

module.exports = SensorService;
```

---

## Troubleshooting

### Issue: "Encryption key must be provided"

**Solution:**
```bash
# Add to .env file
DB_ENCRYPTION_KEY=your-32-character-encryption-key!!
```

### Issue: "Database not initialized"

**Solution:**
```javascript
// Ensure database module is enabled
await bootstrap.bootstrap({
    modules: { database: true }
});
```

### Issue: "Port already in use"

**Solution:**
```bash
# Change port in .env
API_PORT=3002
WEBSOCKET_PORT=8081

# Or find and kill process using the port
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3001
kill -9 <PID>
```

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check database credentials in .env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=monitor_db

# Test database connection
mysql -h localhost -u root -p
```

### Issue: "WebSocket not connecting"

**Solution:**
```javascript
// 1. Ensure WebSocket module is enabled
await bootstrap.bootstrap({
    modules: { websocket: true }
});

// 2. Check CORS settings
// 3. Verify WebSocket port is not blocked by firewall
```

### Issue: "Events not firing"

**Solution:**
```javascript
// Subscribe BEFORE emitting
const eventBus = getEventBus();

// ✅ Correct order
eventBus.on('my:event', handler);
eventBus.emit('my:event', data);

// ❌ Wrong order
eventBus.emit('my:event', data);
eventBus.on('my:event', handler); // Too late!
```

---

## Next Steps

1. **Read the full documentation:**
   - [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Complete API reference
   - [FRAMEWORK_REVISION_SUMMARY.md](FRAMEWORK_REVISION_SUMMARY.md) - Architecture details

2. **Run verification tests:**
   ```bash
   node verify_all.js
   ```

3. **Explore examples:**
   - Check out `database-example.js`
   - Try `express-server.js`
   - Implement real-time features

4. **Build your application:**
   - Start with basic CRUD operations
   - Add validation and error handling
   - Implement real-time updates
   - Add authentication and authorization

---

## Support

For issues or questions:
- Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md#troubleshooting)
- Run verification: `node verify_all.js`
- Review examples in this tutorial

---

**Happy coding! 🚀**
