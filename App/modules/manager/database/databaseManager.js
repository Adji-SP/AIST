// modules/database/databaseManager.js - Cleaned and Refactored
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
            this.logger.info('Initializing database manager', { mode: this.dbType });
            alert.system.startup(`Database Manager (${this.dbType} mode)`);

            // Initialize the Adapter (The Single Source of Truth)
            this.dbAdapter = getDatabaseAdapter(this.encryptionService, this.config);
            await this.dbAdapter.initialize();
            
            // Assign adapter to this.db to maintain compatibility with legacy code 
            // that calls this.db.postData() directly
            this.db = this.dbAdapter;

            // Log success details
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

            // Emit event so other modules know DB is ready
            this.eventBus.emit('database:ready', this);

        } catch (error) {
            this.logger.error('Database initialization failed', { error: error.message, stack: error.stack });
            alert.database.error('Database initialization', error);
            
            this.eventBus.emit('database:error', error);
            throw error;
        }
    }

    /**
     * Returns the raw database instance (now the Adapter).
     * Used by controllers and services.
     */
    getDatabase() {
        return this.db;
    }

    /**
     * Explicitly returns the adapter (same as getDatabase in this new architecture).
     * Kept for interface consistency.
     */
    getDatabaseAdapter() {
        return this.dbAdapter;
    }

    /**
     * Returns configuration metadata.
     */
    getDatabaseInfo() {
        if (this.dbAdapter) {
            return this.dbAdapter.getConfig();
        }
        return {
            type: this.dbType,
            status: 'uninitialized'
        };
    }

    /**
     * Gracefully closes connections.
     */
    async close() {
        if (this.dbAdapter) {
            try {
                this.logger.info('Closing database connection');
                await this.dbAdapter.close();
                
                this.logger.info('Database connection closed successfully');
                alert.database.disconnected('Database Manager');
                
                this.eventBus.emit('database:closed', this);
                this.db = null;
                this.dbAdapter = null;
            } catch (error) {
                this.logger.error('Error closing database connection', { error: error.message });
                alert.database.error('Connection close', error);
                this.eventBus.emit('database:error', error);
                throw error;
            }
        }
    }

    // Helper methods for type checking (used by some UI logic)
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

    // Health check delegation
    async getHealthCheck() {
        if (this.dbAdapter && this.dbAdapter.healthCheck) {
            return await this.dbAdapter.healthCheck();
        }
        return { status: 'unknown', type: this.dbType };
    }
}

module.exports = DatabaseManager;