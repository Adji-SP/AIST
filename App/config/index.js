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
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                name: process.env.DB_NAME || 'monitor',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                connectionLimit: 10
            },
            api: {
                port: process.env.API_PORT || 3001,
                host: process.env.API_HOST || 'localhost',
                cors: true,
                rateLimit: {
                    windowMs: 15 * 60 * 1000,
                    max: 100
                }
            },
            websocket: {
                port: process.env.WS_PORT || 3002,
                path: '/socket.io'
            },
            serial: {
                baudRate: 9600,
                dataBits: 8,
                parity: 'none',
                stopBits: 1
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
