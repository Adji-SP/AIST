/**
 * Framework-Agnostic Backend Bootstrap
 *
 * This module initializes the backend in any environment:
 * - Electron (desktop app)
 * - Express (web server)
 * - Standalone Node.js
 * - Serverless functions
 */

const path = require('path');
const EventEmitter = require('events');

// Import modular components
const DatabaseManager = require('./modules/modules_config/database/databaseManager');
const APIServer = require('./modules/modules_config/api/apiServer');
const SerialManager = require('./modules/modules_config/serial/serialManager');
const IPCManager = require('./modules/modules_config/ipc/ipcManager');
const WebsocketManager = require('./modules/modules_config/websocket/websocketManager');

class AppBootstrap extends EventEmitter {
    constructor() {
        super();
        this.initialized = false;
        this.mode = null;
        this.config = {};

        // Module instances
        this.databaseManager = null;
        this.apiServer = null;
        this.serialManager = null;
        this.ipcManager = null;
        this.websocketManager = null;
        this.windowManager = null;
    }

    /**
     * Initialize the backend
     * @param {Object} options - Configuration options
     * @param {string} options.mode - 'electron' | 'express' | 'standalone' | 'serverless'
     * @param {Object} options.modules - Which modules to enable
     * @param {Object} options.config - Additional configuration
     * @param {Object} options.electron - Electron-specific options (app, window)
     * @returns {Promise<AppBootstrap>}
     */
    async bootstrap(options = {}) {
        if (this.initialized) {
            console.warn('Backend already initialized');
            return this;
        }

        // Default configuration
        const {
            mode = 'standalone',
            modules = {
                database: true,
                api: true,
                serial: false,
                websocket: false,
                ipc: false,
                window: false
            },
            config = {},
            electron = null
        } = options;

        this.mode = mode;
        this.config = config;

        try {
            console.log(`[Bootstrap] Initializing backend in ${mode} mode...`);

            // Initialize modules based on configuration
            if (modules.database) {
                await this.initializeDatabase();
            }

            if (modules.window && mode === 'electron' && electron) {
                await this.initializeWindow(electron);
            }

            if (modules.api) {
                await this.initializeAPI();
            }

            if (modules.serial && mode === 'electron') {
                await this.initializeSerial();
            }

            if (modules.websocket) {
                await this.initializeWebsocket();
            }

            if (modules.ipc && mode === 'electron') {
                await this.initializeIPC();
            }

            this.initialized = true;
            this.emit('ready');
            console.log('[Bootstrap] Backend initialized successfully');

            return this;
        } catch (error) {
            console.error('[Bootstrap] Failed to initialize backend:', error);
            this.emit('error', error);
            throw error;
        }
    }

    async initializeDatabase() {
        console.log('[Bootstrap] Initializing database...');
        this.databaseManager = new DatabaseManager();
        await this.databaseManager.initialize();
        this.emit('database:ready', this.databaseManager);
    }

    async initializeWindow(electron) {
        console.log('[Bootstrap] Initializing window manager...');
        const WindowManager = require('./modules/modules_config/window/windowManager');
        this.windowManager = new WindowManager();

        if (electron.window) {
            // Use provided window
            this.windowManager.mainWindow = electron.window;
        } else {
            // Create new window
            this.windowManager.createWindow();
        }

        this.emit('window:ready', this.windowManager);
    }

    async initializeAPI() {
        console.log('[Bootstrap] Initializing API server...');
        const db = this.databaseManager ? this.databaseManager.getDatabase() : null;
        this.apiServer = new APIServer(db);

        if (this.mode !== 'serverless') {
            await this.apiServer.start();
        }

        this.emit('api:ready', this.apiServer);
    }

    async initializeSerial() {
        console.log('[Bootstrap] Initializing serial manager...');
        const db = this.databaseManager ? this.databaseManager.getDatabase() : null;
        const window = this.windowManager ? this.windowManager.getMainWindow() : null;

        this.serialManager = new SerialManager(db, window);
        await this.serialManager.initialize();
        this.emit('serial:ready', this.serialManager);
    }

    async initializeWebsocket() {
        console.log('[Bootstrap] Initializing websocket manager...');
        const db = this.databaseManager ? this.databaseManager.getDatabase() : null;
        const window = this.windowManager ? this.windowManager.getMainWindow() : null;

        this.websocketManager = new WebsocketManager(db, window);
        await this.websocketManager.initialize();
        this.emit('websocket:ready', this.websocketManager);
    }

    async initializeIPC() {
        console.log('[Bootstrap] Initializing IPC manager...');
        const db = this.databaseManager ? this.databaseManager.getDatabase() : null;

        this.ipcManager = new IPCManager(db, this.serialManager);
        this.ipcManager.setupHandlers();
        this.emit('ipc:ready', this.ipcManager);
    }

    /**
     * Cleanup and shutdown all modules
     */
    async shutdown() {
        console.log('[Bootstrap] Shutting down backend...');

        try {
            if (this.serialManager) {
                await this.serialManager.close();
            }
            if (this.websocketManager && this.websocketManager.close) {
                await this.websocketManager.close();
            }
            if (this.apiServer) {
                await this.apiServer.stop();
            }
            if (this.databaseManager) {
                await this.databaseManager.close();
            }

            this.initialized = false;
            this.emit('shutdown');
            console.log('[Bootstrap] Backend shutdown complete');
        } catch (error) {
            console.error('[Bootstrap] Error during shutdown:', error);
            throw error;
        }
    }

    /**
     * Get a specific module instance
     */
    getModule(name) {
        const moduleMap = {
            database: this.databaseManager,
            api: this.apiServer,
            serial: this.serialManager,
            ipc: this.ipcManager,
            websocket: this.websocketManager,
            window: this.windowManager
        };

        return moduleMap[name] || null;
    }

    /**
     * Check if backend is ready
     */
    isReady() {
        return this.initialized;
    }

    /**
     * Get current mode
     */
    getMode() {
        return this.mode;
    }
}

// Export singleton instance
const appBootstrap = new AppBootstrap();

module.exports = appBootstrap;
module.exports.AppBootstrap = AppBootstrap;
