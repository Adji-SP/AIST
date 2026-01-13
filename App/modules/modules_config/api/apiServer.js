// modules/api/apiServer.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const LifecycleManager = require('../../lib/base/LifecycleManager');
const { getInstance: getEventBus } = require('../../lib/events/EventBus');
const { getInstance: getLogger } = require('../../lib/services/LoggingService');
const alert = require('../../lib/alert'); // Keep for backward compatibility

// Controllers
const dbController = require('../../../Http/Controllers/databaseController');
const authController = require('../../../Http/Controllers/authController');
const mauiController = require('../../../Http/Controllers/mauiController');

class APIServer extends LifecycleManager {
    constructor(database, config = {}) {
        super('APIServer');

        this.app = express();
        this.database = database;
        this.config = config;
        this.server = null;
        this.port = config.port || 3001;

        // Initialize new services
        this.eventBus = getEventBus();
        this.logger = getLogger().child({ module: 'APIServer', port: this.port });

        this.setupMiddleware();
        this.setupRoutes();
        this.initializeControllers();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(bodyParser.json());
    }

    initializeControllers() {
        dbController.initializeController(this.database);
        authController.initializeController(this.database);
    }

    setupRoutes() {
        // Authentication Routes
        this.app.post('/api/auth/register', authController.register);
        this.app.post('/api/auth/login', authController.login);

        // Data Routes
        this.app.post('/api/sensor-data', dbController.insertSensorData);
        this.app.post('/api/maui-data', mauiController.genericDataHandler);

        // Health check
        this.app.get('/api/health', (req, res) => {
            res.json({ 
                success: true, 
                message: 'API server is running',
                timestamp: new Date().toISOString()
            });
        });

        /*
        this.app.get('/api/profile', authenticateToken, async (req, res) => {
            try {
                const userProfile = await this.database.findUserByEmail(req.user.email);
                const { password, ...profileData } = userProfile;
                res.json({ success: true, data: profileData });
            } catch (error) {
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });
        */
    }

    // Override LifecycleManager method
    async _doInitialize() {
        return new Promise((resolve, reject) => {
            try {
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

    // Override LifecycleManager method
    async _doShutdown() {
        if (this.server) {
            return new Promise((resolve) => {
                this.logger.info('Stopping API server');
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