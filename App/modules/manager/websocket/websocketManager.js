const LifecycleManager = require('../../lib/base/LifecycleManager');
const { getInstance: getEventBus } = require('../../lib/events/EventBus');
const { getInstance: getLogger } = require('../../lib/services/LoggingService');
const WebSocketHandler = require('../../lib/com/webSocketCommunicator');
const alert = require('../../lib/alert'); // Keep for backward compatibility

class WebsocketManager extends LifecycleManager {
    constructor(database, mainWindow, config = {}) {
        super('WebSocketManager');

        this.database = database;
        this.mainWindow = mainWindow;
        this.websocketHandler = null;
        this.config = config;
        this.databaseAdapter = null; // Enhanced database adapter support

        // Initialize new services
        this.eventBus = getEventBus();
        const mode = this.mainWindow ? 'Electron' : 'Server';
        this.logger = getLogger().child({ module: 'WebSocketManager', mode, port: config.port || 8080 });
    }

    // Override LifecycleManager method
    async _doInitialize() {
        try {
            const mode = this.mainWindow ? 'Electron' : 'Server';
            this.logger.info('Initializing WebSocket manager', { mode, port: this.config.port || 8080 });

            // Check if database has enhanced adapter support
            if (this.database && typeof this.database.getDatabaseAdapter === 'function') {
                this.databaseAdapter = this.database.getDatabaseAdapter();
                this.logger.info('Enhanced database adapter mode enabled');
                alert.system.config('WebSocket', 'Enhanced database adapter mode enabled');
            }

            this.websocketHandler = new WebSocketHandler(
                this.config,
                this.database,
                this.mainWindow
            );

            // In server mode (no window), start immediately
            // In Electron mode, wait for window to load
            const delay = this.mainWindow ? 2000 : 500;
            setTimeout(async () => {
                await this.websocketHandler.start();
            }, delay);

            this.logger.info('WebSocket manager initialized successfully', { mode });
            alert.system.ready(`WebSocket Manager (${mode} mode)`);
            this.eventBus.emit('websocket:ready', this);
        } catch (error) {
            this.logger.error('WebSocket manager initialization failed', { error: error.message });
            alert.error('WEBSOCKET', 'Manager initialization failed', error);
            this.eventBus.emit('websocket:error', error);
            throw error;
        }
    }

    // Override LifecycleManager method
    async _doShutdown() {
        if (this.websocketHandler) {
            try {
                this.logger.info('Shutting down WebSocket handler');
                await this.websocketHandler.stop();
                this.logger.info('WebSocket handler stopped successfully');
                this.eventBus.emit('websocket:closed', this);
            } catch (error) {
                this.logger.error('Error stopping WebSocket handler', { error: error.message });
                throw error;
            }
        }
    }

    // Keep legacy initialize method for backward compatibility
    async initialize() {
        return super.initialize();
    }

    getStatus() {
        return this.websocketHandler ? this.websocketHandler.getStatus() : null;
    }

    async stop() {
        if (this.websocketHandler) {
            await this.websocketHandler.stop();
        }
    }

    broadcastToAll(message) {
        if (this.websocketHandler) {
            return this.websocketHandler.broadcastToAll(message);
        }
        return 0;
    }

    // NEW: Enhanced methods for database adapter integration
    broadcastToRoom(roomId, message) {
        if (this.websocketHandler && this.websocketHandler.broadcastToRoom) {
            return this.websocketHandler.broadcastToRoom(roomId, message);
        }
        return 0;
    }

    getDatabaseAdapter() {
        return this.databaseAdapter;
    }

    async getDatabaseHealth() {
        if (this.databaseAdapter && this.databaseAdapter.healthCheck) {
            return await this.databaseAdapter.healthCheck();
        }
        return { status: 'unknown', message: 'Enhanced adapter not available' };
    }
}

module.exports = WebsocketManager;