// modules/api/apiServer.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const LifecycleManager = require('../../lib/base/LifecycleManager');
const { getInstance: getEventBus } = require('../../lib/events/EventBus');
const { getInstance: getLogger } = require('../../lib/services/LoggingService');
const alert = require('../../lib/alert');

class APIServer extends LifecycleManager {
    /**
     * @param {DatabaseManager} database - Database instance
     * @param {Object} config - Server configuration (port, host, etc.)
     * @param {Function} routesFunction - Function to register routes: (app, db) => void
     */
    constructor(database, config = {}, routesFunction = null) {
        super('APIServer');

        this.app = express();
        this.database = database;
        this.config = config;
        this.routesFunction = routesFunction; // Store the route definition function
        this.server = null;
        this.port = config.port || 3001;

        // Initialize services
        this.eventBus = getEventBus();
        this.logger = getLogger().child({ module: 'APIServer', port: this.port });

        this.setupMiddleware();
        // Note: Routes are now set up during initialization, not constructor
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(bodyParser.json());

        // Add request logging middleware
        this.app.use((req, res, next) => {
            this.logger.debug(`${req.method} ${req.url}`, { ip: req.ip });
            next();
        });
    }

    // Override LifecycleManager method
    async _doInitialize() {
        return new Promise((resolve, reject) => {
            try {
                this.setupHealthCheck();

                if (typeof this.routesFunction === 'function') {
                    this.logger.info('Registering application routes...');
                    this.routesFunction(this.app, this.database);
                } else {
                    this.logger.warn('⚠️ No route definitions provided to APIServer');
                }

                // 3. Start the Server
                this.logger.info('Starting API server', { port: this.port });
                this.server = this.app.listen(this.port, () => {
                    this.logger.info('API server started successfully', { port: this.port });
                    alert.api.serverStarted(this.port);

                    this.eventBus.emit('api:started', { port: this.port, server: this });
                    resolve();
                });

                this.server.on('error', (error) => {
                    this.logger.error('API server error', { error: error.message });
                    this.eventBus.emit('api:error', error);
                    reject(error);
                });

            } catch (error) {
                this.logger.error('Failed to start API server', { error: error.message });
                reject(error);
            }
        });
    }

    setupHealthCheck() {
        this.app.get('/api/health', (req, res) => {
            res.json({
                success: true,
                message: 'API server is running',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        });
    }

    // Override LifecycleManager method
    async _doShutdown() {
        if (this.server) {
            return new Promise((resolve) => {
                this.logger.info('Stopping API server...');
                this.server.close(() => {
                    this.logger.info('API server stopped successfully');
                    this.eventBus.emit('api:stopped', this);
                    resolve();
                });
            });
        }
    }

    // Keep legacy start/stop methods for backward compatibility
    start() {
        return this.initialize();
    }

    async stop() {
        return this.shutdown();
    }

    getApp() {
        return this.app;
    }

    getPort() {
        return this.port;
    }
}

module.exports = APIServer;