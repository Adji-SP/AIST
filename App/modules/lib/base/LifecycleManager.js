/**
 * LifecycleManager - Base Class for Module Lifecycle Management
 *
 * Provides standardized lifecycle methods that all managers should implement.
 * Ensures consistent initialization, shutdown, and health check patterns.
 *
 * Lifecycle phases:
 * 1. constructed -> initializing -> initialized -> ready
 * 2. ready -> shutting_down -> shutdown
 */

const { getInstance: getEventBus } = require('../events/EventBus');
const { getInstance: getLogger } = require('../services/LoggingService');

class LifecycleManager {
    constructor(name) {
        this.name = name || this.constructor.name;
        this.state = 'constructed';
        this.eventBus = getEventBus();
        this.logger = getLogger();
        this.initializeStartTime = null;
        this.shutdownStartTime = null;
    }

    /**
     * Initialize the manager
     * Should be overridden by subclasses
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.state !== 'constructed') {
            this.logger.warn(`${this.name} already initialized (state: ${this.state})`);
            return;
        }

        this.state = 'initializing';
        this.initializeStartTime = Date.now();

        try {
            await this._doInitialize();
            this.state = 'initialized';
            this.state = 'ready';

            const duration = Date.now() - this.initializeStartTime;
            this.logger.info(`${this.name} initialized successfully`, { duration: `${duration}ms` });

            this.eventBus.emit(`${this.name.toLowerCase()}:ready`, this);
        } catch (error) {
            this.state = 'error';
            this.logger.error(`${this.name} initialization failed`, { error: error.message });
            this.eventBus.emit(`${this.name.toLowerCase()}:error`, error);
            throw error;
        }
    }

    /**
     * Internal initialization logic
     * Override this method in subclasses
     * @protected
     */
    async _doInitialize() {
        // To be overridden
    }

    /**
     * Shutdown the manager
     * Should be overridden by subclasses
     * @returns {Promise<void>}
     */
    async shutdown() {
        if (this.state === 'shutdown' || this.state === 'shutting_down') {
            this.logger.warn(`${this.name} already shutting down or shutdown`);
            return;
        }

        this.state = 'shutting_down';
        this.shutdownStartTime = Date.now();

        try {
            await this._doShutdown();
            this.state = 'shutdown';

            const duration = Date.now() - this.shutdownStartTime;
            this.logger.info(`${this.name} shutdown successfully`, { duration: `${duration}ms` });

            this.eventBus.emit(`${this.name.toLowerCase()}:shutdown`, this);
        } catch (error) {
            this.state = 'error';
            this.logger.error(`${this.name} shutdown failed`, { error: error.message });
            throw error;
        }
    }

    /**
     * Internal shutdown logic
     * Override this method in subclasses
     * @protected
     */
    async _doShutdown() {
        // To be overridden
    }

    /**
     * Health check
     * Should be overridden by subclasses
     * @returns {Promise<Object>} Health status
     */
    async healthCheck() {
        return {
            name: this.name,
            state: this.state,
            healthy: this.state === 'ready',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get current state
     * @returns {string} Current state
     */
    getState() {
        return this.state;
    }

    /**
     * Check if manager is ready
     * @returns {boolean} Is ready
     */
    isReady() {
        return this.state === 'ready';
    }

    /**
     * Check if manager is initializing
     * @returns {boolean} Is initializing
     */
    isInitializing() {
        return this.state === 'initializing';
    }

    /**
     * Check if manager is shutting down
     * @returns {boolean} Is shutting down
     */
    isShuttingDown() {
        return this.state === 'shutting_down';
    }

    /**
     * Check if manager is shutdown
     * @returns {boolean} Is shutdown
     */
    isShutdown() {
        return this.state === 'shutdown';
    }

    /**
     * Get manager name
     * @returns {string} Manager name
     */
    getName() {
        return this.name;
    }
}

module.exports = LifecycleManager;
