// modules/database/databaseManager.js - Enhanced with new database adapter
const FirebaseDB = require('../../lib/db/firebaseDB');
const Database = require('../../lib/db/mysqlDB');
const CosmosDB = require('../../lib/db/cosmosDB');
const { getInstance: getDatabaseAdapter } = require('../../lib/db/databaseAdapter');
const { getInstance: getEventBus } = require('../../lib/events/EventBus');
const { getInstance: getLogger } = require('../../lib/services/LoggingService');
const alert = require('../../lib/alert'); // Keep for backward compatibility

class DatabaseManager {
    constructor(encryptionService, config = {}) {
        if (!encryptionService) {
            throw new Error('EncryptionService is required for DatabaseManager');
        }

        this.encryptionService = encryptionService;
        this.config = config;
        this.db = null;
        this.dbAdapter = null;
        this.dbType = config.type || 'mysql';

        // Initialize new services
        this.eventBus = getEventBus();
        this.logger = getLogger().child({ module: 'DatabaseManager', dbType: this.dbType });

        // Support 'firebase' as alias for 'firestore'
        if (this.dbType === 'firebase') {
            this.dbType = 'firestore';
        }
    }

    async initialize() {
        try {
            // Use both new logger and old alert for backward compatibility
            this.logger.info('Initializing database manager', { mode: this.dbType });
            alert.system.startup(`Database Manager (${this.dbType} mode)`);

            // NEW: Use enhanced database adapter for all supported types
            const supportedTypes = ['mysql', 'firestore', 'cosmosdb', 'hybrid', 'hybrid-cosmos'];

            if (supportedTypes.includes(this.dbType)) {
                this.dbAdapter = getDatabaseAdapter(this.encryptionService, this.config);
                await this.dbAdapter.initialize();
                this.db = this.dbAdapter; // Provide compatibility interface

                const adapterConfig = this.dbAdapter.getConfig();
                this.logger.info('Database initialized successfully', {
                    type: adapterConfig.type,
                    primary: adapterConfig.primaryDatabase,
                    secondary: adapterConfig.secondaryDatabase
                });
                alert.success('DATABASE', `${adapterConfig.type} mode initialized successfully`);
                if (adapterConfig.primaryDatabase) {
                    alert.info('DATABASE', `Primary: ${adapterConfig.primaryDatabase}`);
                }
                if (adapterConfig.secondaryDatabase) {
                    alert.info('DATABASE', `Secondary: ${adapterConfig.secondaryDatabase} (auto-sync)`);
                }

                // Emit event for new framework
                this.eventBus.emit('database:ready', this);
                return;
            }

            // Fallback: Legacy single database initialization (backward compatibility)
            this.logger.warn('Using legacy database initialization');
            alert.warning('DATABASE', 'Using legacy database initialization. Consider using DB_TYPE env variable.');

            if (this.dbType === 'firebase' || this.dbType === 'firestore') {
                const fbConfig = this.config.firebase || {};
                this.db = new FirebaseDB({
                    apiKey: fbConfig.apiKey,
                    authDomain: fbConfig.authDomain,
                    databaseURL: fbConfig.databaseURL,
                    projectId: fbConfig.projectId,
                    storageBucket: fbConfig.storageBucket,
                    messagingSenderId: fbConfig.messagingSenderId,
                    appId: fbConfig.appId,
                    measurementId: fbConfig.measurementId,
                    useFirestore: fbConfig.useFirestore
                }, this.encryptionService);
                await this.db.connect();
            } else if (this.dbType === 'cosmosdb') {
                const cosmosConfig = this.config.cosmosdb || {};
                this.db = new CosmosDB({
                    connectionString: cosmosConfig.connectionString,
                    accountName: cosmosConfig.accountName,
                    accountKey: cosmosConfig.accountKey,
                    database: cosmosConfig.database || 'monitor_db'
                }, this.encryptionService);
                await this.db.connect();
            } else {
                const mysqlConfig = this.config.mysql || {};
                this.db = new Database({
                    host: mysqlConfig.host || 'localhost',
                    user: mysqlConfig.user || 'root',
                    password: mysqlConfig.password || '',
                    database: mysqlConfig.database || 'monitor_db'
                }, this.encryptionService);
                await this.db.connect();
            }

            this.logger.info('Database layer ready', { type: this.dbType });
            alert.database.connected(this.dbType, 'Database layer ready');

            // Emit event for new framework
            this.eventBus.emit('database:ready', this);

        } catch (error) {
            this.logger.error('Database initialization failed', { error: error.message, stack: error.stack });
            alert.database.error('Database initialization', error);
            this.eventBus.emit('database:error', error);
            throw error;
        }
    }

    getDatabase() {
        return this.db;
    }

    // NEW: Get enhanced database adapter
    getDatabaseAdapter() {
        return this.dbAdapter;
    }

    // Get database configuration info
    getDatabaseInfo() {
        if (this.dbAdapter) {
            return this.dbAdapter.getConfig();
        }
        return {
            type: this.dbType,
            useFirestore: this.db?.isFirestore || false,
            useAdapter: !!this.dbAdapter
        };
    }

    async close() {
        if (this.db) {
            try {
                this.logger.info('Closing database connection');
                await this.db.close();
                this.logger.info('Database connection closed successfully');
                alert.database.disconnected('Database Manager');
                this.eventBus.emit('database:closed', this);
            } catch (error) {
                this.logger.error('Error closing database connection', { error: error.message });
                alert.database.error('Connection close', error);
                this.eventBus.emit('database:error', error);
                throw error;
            }
        }
    }

    isFirebase() {
        return this.dbType === 'firestore' || this.dbType === 'firebase';
    }

    isCosmos() {
        return this.dbType === 'cosmosdb' || this.dbType === 'hybrid-cosmos';
    }

    isMySQL() {
        return this.dbType === 'mysql' || this.dbType === 'hybrid' || this.dbType === 'hybrid-cosmos';
    }

    isHybrid() {
        return this.dbType === 'hybrid' || this.dbType === 'hybrid-cosmos';
    }

    // NEW: Get health check information
    async getHealthCheck() {
        if (this.dbAdapter && this.dbAdapter.healthCheck) {
            return await this.dbAdapter.healthCheck();
        }
        return { status: 'unknown', type: this.isFirebase() ? 'firebase' : 'mysql' };
    }
}

module.exports = DatabaseManager;