/**
 * Configuration Resolver
 *
 * Provides framework-agnostic configuration resolution.
 * Automatically detects the environment and loads appropriate configs.
 */

const path = require('path');
const fs = require('fs');

class ConfigResolver {
    constructor() {
        this.environment = process.env.NODE_ENV || 'development';
        this.appRoot = path.resolve(__dirname, '..', '..');
        this.appDir = path.resolve(__dirname, '..');
        this.configCache = {};
    }

    /**
     * Detect the runtime environment
     * @returns {string} 'electron' | 'express' | 'react' | 'node' | 'serverless'
     */
    detectEnvironment() {
        // Check if running in Electron
        if (process.versions.electron) {
            return 'electron';
        }

        // Check if Express is available
        try {
            const express = require.resolve('express');
            if (express && process.env.EXPRESS_SERVER) {
                return 'express';
            }
        } catch (e) {
            // Express not available
        }

        // Check if React (CRA) build
        if (process.env.REACT_APP_VERSION || process.env.CREATE_REACT_APP) {
            return 'react';
        }

        // Check for serverless environment
        if (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL || process.env.NETLIFY) {
            return 'serverless';
        }

        // Default to Node.js
        return 'node';
    }

    /**
     * Resolve all configurations at once (for dependency injection)
     * @param {Object} overrides - Configuration overrides per module
     * @returns {Object} Complete configuration object with all modules
     */
    resolveAll(overrides = {}) {
        return {
            database: this.getConfig('database', overrides.database),
            api: this.getConfig('api', overrides.api),
            websocket: this.getConfig('websocket', overrides.websocket),
            serial: this.getConfig('serial', overrides.serial),
            window: this.getConfig('window', overrides.window),
            ipc: this.getConfig('ipc', overrides.ipc),
            encryption: {
                key: process.env.DB_ENCRYPTION_KEY
            }
        };
    }

    /**
     * Get configuration for a specific module
     * @param {string} moduleName - Name of the module (e.g., 'database', 'api')
     * @param {Object} overrides - Configuration overrides
     * @returns {Object} Configuration object
     */
    getConfig(moduleName, overrides = {}) {
        const cacheKey = `${moduleName}_${this.environment}`;

        if (this.configCache[cacheKey]) {
            return { ...this.configCache[cacheKey], ...overrides };
        }

        const defaultConfig = this.getDefaultConfig(moduleName);
        const envConfig = this.getEnvironmentConfig(moduleName);

        const mergedConfig = {
            ...defaultConfig,
            ...envConfig,
            ...overrides
        };

        this.configCache[cacheKey] = mergedConfig;
        return mergedConfig;
    }

    /**
     * Get default configuration for a module
     */
    getDefaultConfig(moduleName) {
        const defaults = {
            database: {
                type: process.env.DB_TYPE || 'mysql',
                mysql: {
                    host: process.env.MYSQL_HOST || 'localhost',
                    port: parseInt(process.env.MYSQL_PORT) || 3306,
                    user: process.env.MYSQL_USER || 'root',
                    password: process.env.MYSQL_PASSWORD || '',
                    database: process.env.MYSQL_DATABASE || 'monitor_db',
                    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10
                },
                firebase: {
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
                    databaseURL: process.env.FIREBASE_DATABASE_URL,
                    apiKey: process.env.FIREBASE_API_KEY,
                    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
                    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
                    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
                    appId: process.env.FIREBASE_APP_ID,
                    useFirestore: process.env.USE_FIRESTORE !== 'false'
                },
                cosmosdb: {
                    connectionString: process.env.COSMOS_CONNECTION_STRING,
                    accountName: process.env.COSMOS_ACCOUNT_NAME,
                    accountKey: process.env.COSMOS_ACCOUNT_KEY,
                    database: process.env.COSMOS_DATABASE || 'monitor_db'
                }
            },
            api: {
                port: parseInt(process.env.API_PORT) || 3001,
                host: process.env.API_HOST || 'localhost',
                cors: true,
                rateLimit: {
                    windowMs: 15 * 60 * 1000,
                    max: 100
                }
            },
            websocket: {
                port: parseInt(process.env.WEBSOCKET_PORT) || 8080,
                path: '/socket.io',
                enableAuth: process.env.WEBSOCKET_ENABLE_AUTH === 'true',
                enableHeartbeat: process.env.WEBSOCKET_ENABLE_HEARTBEAT !== 'false',
                maxConnections: parseInt(process.env.WEBSOCKET_MAX_CONNECTIONS) || 100
            },
            serial: {
                port: process.env.SERIAL_PORT,
                baudRate: parseInt(process.env.SERIAL_BAUDRATE) || 9600,
                dataBits: parseInt(process.env.SERIAL_DATA_BITS) || 8,
                parity: process.env.SERIAL_PARITY || 'none',
                stopBits: parseInt(process.env.SERIAL_STOP_BITS) || 1,
                autoOpen: process.env.SERIAL_AUTO_OPEN !== 'false'
            },
            window: {
                width: parseInt(process.env.WINDOW_WIDTH) || 1280,
                height: parseInt(process.env.WINDOW_HEIGHT) || 800,
                entryPoint: process.env.FRONTEND_ENTRY_POINT
            },
            ipc: {
                // IPC configuration (if needed in future)
            }
        };

        return defaults[moduleName] || {};
    }

    /**
     * Get environment-specific configuration
     */
    getEnvironmentConfig(moduleName) {
        const configFile = path.join(this.appDir, 'config', `${moduleName}.${this.environment}.js`);

        if (fs.existsSync(configFile)) {
            try {
                return require(configFile);
            } catch (error) {
                console.warn(`Failed to load ${configFile}:`, error.message);
            }
        }

        return {};
    }

    /**
     * Get the CRACO config (for React/CRA projects)
     */
    getCracoConfig() {
        return require('./craco.config.js');
    }

    /**
     * Get all paths
     */
    getPaths() {
        return {
            appRoot: this.appRoot,
            appDir: this.appDir,
            configDir: __dirname,
            modulesDir: path.join(this.appDir, 'modules'),
            libDir: path.join(this.appDir, 'modules', 'lib'),
            controllersDir: path.join(this.appDir, 'Http', 'Controllers')
        };
    }

    /**
     * Validate configuration
     */
    validateConfig(moduleName, config) {
        // Add validation logic here
        // For now, just check if required fields exist
        if (moduleName === 'database' && !config.type) {
            throw new Error('Database type is required');
        }

        return true;
    }

    /**
     * Clear configuration cache
     */
    clearCache() {
        this.configCache = {};
    }
}

// Export singleton instance
const configResolver = new ConfigResolver();

module.exports = configResolver;
module.exports.ConfigResolver = ConfigResolver;
