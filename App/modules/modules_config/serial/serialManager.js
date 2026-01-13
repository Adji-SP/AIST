// modules/serial/serialManager.js
const LifecycleManager = require('../../lib/base/LifecycleManager');
const { getInstance: getEventBus } = require('../../lib/events/EventBus');
const { getInstance: getLogger } = require('../../lib/services/LoggingService');
const SerialCommunicator = require('../../lib/com/serialCommunicator');
const alert = require('../../lib/alert'); // Keep for backward compatibility

class SerialManager extends LifecycleManager {
    constructor(database, mainWindow, config = {}) {
        super('SerialManager');

        this.database = database;
        this.mainWindow = mainWindow;
        this.serialCommunicator = null;
        this.config = config;

        // Initialize new services
        this.eventBus = getEventBus();
        const mode = this.mainWindow ? 'Electron' : 'Server';
        this.logger = getLogger().child({ module: 'SerialManager', mode });
    }

    // Override LifecycleManager method
    async _doInitialize() {
        try {
            const mode = this.mainWindow ? 'Electron' : 'Server';
            this.logger.info('Initializing serial manager', { mode });

            this.serialCommunicator = new SerialCommunicator(
                this.config,
                this.database,
                this.mainWindow
            );

            // In server mode (no window), connect immediately
            // In Electron mode, wait for window to load
            const delay = this.mainWindow ? 2000 : 500;
            setTimeout(() => {
                this.serialCommunicator.connect();
            }, delay);

            this.logger.info('Serial manager initialized successfully', { mode });
            alert.system.ready(`Serial Manager (${mode} mode)`);
            this.eventBus.emit('serial:ready', this);
        } catch (error) {
            this.logger.error('Serial manager initialization failed', { error: error.message });
            alert.error('SERIAL', 'Manager initialization failed', error);
            this.eventBus.emit('serial:error', error);
            throw error;
        }
    }

    // Override LifecycleManager method
    async _doShutdown() {
        if (this.serialCommunicator) {
            try {
                this.logger.info('Shutting down serial communicator');
                await this.serialCommunicator.close();
                this.logger.info('Serial communicator closed successfully');
                this.eventBus.emit('serial:closed', this);
            } catch (error) {
                this.logger.error('Error closing serial communicator', { error: error.message });
                throw error;
            }
        }
    }

    // Keep legacy initialize method for backward compatibility
    async initialize() {
        return super.initialize();
    }

    getStatus() {
        return this.serialCommunicator ? this.serialCommunicator.getStatus() : null;
    }

    async forceReconnect() {
        if (this.serialCommunicator) {
            await this.serialCommunicator.forceReconnect();
        }
    }

    async disconnect() {
        if (this.serialCommunicator) {
            await this.serialCommunicator.disconnect();
        }
    }

    async scanForBetterPorts() {
        if (this.serialCommunicator) {
            await this.serialCommunicator.scanForBetterPorts();
        }
    }

    setDynamicPortSwitching(enabled) {
        if (this.serialCommunicator) {
            this.serialCommunicator.setDynamicPortSwitching(enabled);
        }
    }

    sendData(data) {
        if (this.serialCommunicator) {
            this.serialCommunicator.sendData(data);
        }
    }

    async close() {
        if (this.serialCommunicator) {
            try {
                await this.serialCommunicator.close();
                console.log('Serial communicator closed');
            } catch (error) {
                console.error('Error closing serial communicator:', error);
                throw error;
            }
        }
    }

    isConnected() {
        return this.serialCommunicator ? this.serialCommunicator.isConnected() : false;
    }
}

module.exports = SerialManager;