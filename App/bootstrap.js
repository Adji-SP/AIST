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

// Import configuration and constants
const configResolver = require('./config');
const { EVENTS } = require('./config/constants');
const { getInstance: getEventBus } = require('./modules/lib/events/EventBus');
const registerRoutes = require('./Http/routes/routes');

// Import modular components
const DatabaseManager = require('./modules/manager/database/databaseManager');
const APIServer = require('./modules/manager/api/apiServer');
const SerialManager = require('./modules/manager/serial/serialManager');
const IPCManager = require('./modules/manager/ipc/ipcManager');
const WebsocketManager = require('./modules/manager/websocket/websocketManager');
const EncryptionService = require('./modules/lib/security/EncryptionService');
const DatabaseService = require('./modules/lib/services/DatabaseService');
const { getInstance: getValidationService } = require('./modules/lib/services/ValidationService');

class AppBootstrap {
    constructor() {
        this.initialized = false;
        this.mode = null;
        this.config = {};
        this.eventBus = getEventBus(); // Use centralized EventBus

        // Cross-cutting services
        this.encryptionService = null;

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

        // Resolve all configurations from environment and config files
        console.log('[Bootstrap] Resolving configurations...');
        this.config = configResolver.resolveAll(config);

        try {
            console.log(`[Bootstrap] Initializing backend in ${mode} mode...`);

            // Initialize cross-cutting services first
            this.initializeEncryptionService();

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
            this.eventBus.emit(EVENTS.READY);
            console.log('[Bootstrap] Backend initialized successfully');

            return this;
        } catch (error) {
            console.error('[Bootstrap] Failed to initialize backend:', error);
            this.eventBus.emit(EVENTS.ERROR, error);
            throw error;
        }
    }

   initializeEncryptionService() {
        console.log('[Bootstrap] Initializing encryption service...');

        // FIX Issue #2: Validate encryption key exists before access
        if (!this.config.encryption || !this.config.encryption.key) {
            throw new Error('DB_ENCRYPTION_KEY environment variable is required but not set');
        }

        const encryptionKey = this.config.encryption.key;
        this.encryptionService = new EncryptionService(encryptionKey);
        this.eventBus.emit(EVENTS.ENCRYPTION_READY, this.encryptionService);
    }

    async initializeDatabase() {
        console.log('[Bootstrap] Initializing database...');
        this.databaseManager = new DatabaseManager(this.encryptionService, this.config.database);
        await this.databaseManager.initialize();

        // FIX Issue #1: Validate database initialization succeeded
        const dbAdapter = this.databaseManager.getDatabaseAdapter();
        if (!dbAdapter) {
            throw new Error('Database initialization failed - adapter is null');
        }

        const validationService = getValidationService();
        this.databaseService = new DatabaseService(dbAdapter, validationService);

        // Validate DatabaseService was created successfully
        if (!this.databaseService) {
            throw new Error('Database initialization failed - service creation failed');
        }

        this.eventBus.emit(EVENTS.DATABASE_READY, this.databaseManager);
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

        this.eventBus.emit(EVENTS.WINDOW_READY, this.windowManager);
    }

    async initializeAPI() {
        console.log('[Bootstrap] Initializing API server...');

        // FIX Issue #1: Validate database service exists before using it
        if (!this.databaseService) {
            throw new Error('Cannot initialize API server - database service not initialized');
        }

        const db = this.databaseService;
        this.apiServer = new APIServer(db, this.config.api, registerRoutes);

        if (this.mode !== 'serverless') {
            await this.apiServer.start();
        }

        this.eventBus.emit(EVENTS.API_READY, this.apiServer);
    }

    async initializeSerial() {
        console.log('[Bootstrap] Initializing serial manager...');

        // FIX Issue #1: Validate database service exists before using it
        if (!this.databaseService) {
            throw new Error('Cannot initialize serial manager - database service not initialized');
        }

        const db = this.databaseService;
        const window = this.windowManager ? this.windowManager.getMainWindow() : null;

        this.serialManager = new SerialManager(db, window, this.config.serial);
        await this.serialManager.initialize();
        this.eventBus.emit(EVENTS.SERIAL_READY, this.serialManager);
    }

    async initializeWebsocket() {
        console.log('[Bootstrap] Initializing websocket manager...');

        // FIX Issue #1: Validate database service exists before using it
        if (!this.databaseService) {
            throw new Error('Cannot initialize websocket manager - database service not initialized');
        }

        const db = this.databaseService;
        const window = this.windowManager ? this.windowManager.getMainWindow() : null;

        this.websocketManager = new WebsocketManager(db, window, this.config.websocket);
        await this.websocketManager.initialize();
        this.eventBus.emit(EVENTS.WEBSOCKET_READY, this.websocketManager);
    }

   async initializeIPC() {
        console.log('[Bootstrap] Initializing IPC manager...');

        // FIX Issue #1: Validate database service exists before using it
        if (!this.databaseService) {
            throw new Error('Cannot initialize IPC manager - database service not initialized');
        }

        const dbService = this.databaseService;
        this.ipcManager = new IPCManager(dbService, this.serialManager);

        this.ipcManager.setupHandlers();
        this.eventBus.emit(EVENTS.IPC_READY, this.ipcManager);
    }

    /**
     * Cleanup and shutdown all modules (graceful shutdown)
     * @param {Object} options - Shutdown options
     * @returns {Promise<void>}
     */
    async shutdown(options = {}) {
        const { timeout = 30000, force = false } = options;

        if (!this.initialized) {
            console.log('[Bootstrap] Backend already shutdown');
            return;
        }

        console.log('[Bootstrap] Shutting down backend...');
        const shutdownStart = Date.now();

        try {
            // Create shutdown timeout
            const shutdownPromise = this._performShutdown();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Shutdown timeout')), timeout);
            });

            if (force) {
                await shutdownPromise;
            } else {
                await Promise.race([shutdownPromise, timeoutPromise]);
            }

            this.initialized = false;
            this.eventBus.emit(EVENTS.SHUTDOWN);

            const duration = Date.now() - shutdownStart;
            console.log(`[Bootstrap] Backend shutdown complete (${duration}ms)`);
        } catch (error) {
            console.error('[Bootstrap] Error during shutdown:', error);
            if (!force) {
                console.warn('[Bootstrap] Use shutdown({ force: true }) to force shutdown');
            }
            throw error;
        }
    }

    /**
     * Perform the actual shutdown
     * @private
     */
    async _performShutdown() {
        // FIX Issue #12 (Medium): Include IPC in shutdown sequence
        const shutdownOrder = [
            { name: 'IPC', manager: this.ipcManager, method: 'close' },
            { name: 'Serial', manager: this.serialManager, method: 'close' },
            { name: 'WebSocket', manager: this.websocketManager, method: 'close' },
            { name: 'API', manager: this.apiServer, method: 'stop' },
            { name: 'Database', manager: this.databaseManager, method: 'close' }
        ];

        for (const { name, manager, method } of shutdownOrder) {
            if (manager && manager[method]) {
                try {
                    console.log(`[Bootstrap] Shutting down ${name}...`);
                    await manager[method]();
                } catch (error) {
                    console.error(`[Bootstrap] Error shutting down ${name}:`, error.message);
                    // Continue with other shutdowns even if one fails
                }
            }
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

    /**
     * Get the EventBus instance
     * @returns {EventBus} EventBus instance
     */
    getEventBus() {
        return this.eventBus;
    }

    /**
     * Subscribe to a bootstrap event
     * @param {string} eventName - Event name (use constants from EVENTS)
     * @param {Function} handler - Event handler
     * @returns {string} Subscription ID
     */
    on(eventName, handler) {
        return this.eventBus.on(eventName, handler);
    }

    /**
     * Subscribe to a bootstrap event (one-time)
     * @param {string} eventName - Event name (use constants from EVENTS)
     * @param {Function} handler - Event handler
     * @returns {string} Subscription ID
     */
    once(eventName, handler) {
        return this.eventBus.once(eventName, handler);
    }

    /**
     * Unsubscribe from a bootstrap event
     * @param {string} eventName - Event name
     * @param {Function|string} handlerOrId - Handler function or subscription ID
     */
    off(eventName, handlerOrId) {
        this.eventBus.off(eventName, handlerOrId);
    }

    /**
     * Emit a bootstrap event
     * @param {string} eventName - Event name
     * @param {...any} args - Event arguments
     */
    emit(eventName, ...args) {
        this.eventBus.emit(eventName, ...args);
    }
}

// Export singleton instance
const appBootstrap = new AppBootstrap();

module.exports = appBootstrap;
module.exports.AppBootstrap = AppBootstrap;
