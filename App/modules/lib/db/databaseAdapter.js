// lib/db/databaseAdapter.js
// Universal Database Adapter for Monitor Framework - Works with existing structure

const Database = require('./mysqlDB');
const FirebaseDB = require('./firebaseDB');
const CosmosDB = require('./cosmosDB');
const { TABLE_NAMES } = require('../../../config/constants');

class DatabaseAdapter {
    constructor(encryptionService, config = {}) {
        if (!encryptionService) {
            throw new Error('EncryptionService is required for DatabaseAdapter');
        }

        this.encryptionService = encryptionService;
        this.databases = new Map();
        this.primaryDb = null;
        this.secondaryDb = null;
        this.initialized = false;
        this.subscriptions = new Map();

        // Configuration passed from ConfigResolver
        this.config = {
            type: config.type || 'mysql',
            mysql: config.mysql || {},
            firebase: config.firebase || {},
            cosmosdb: config.cosmosdb || {}
        };
    }

    async initialize() {
        if (this.initialized) return;

        try {
            console.log(`🗄️ Initializing Database Adapter (${this.config.type} mode)...`);

            // Initialize primary database
            if (this.config.type === 'mysql' || this.config.type === 'hybrid') {
                this.databases.set('mysql', new Database(this.config.mysql, this.encryptionService));
                await this.databases.get('mysql').connect();
                this.primaryDb = this.databases.get('mysql');
                console.log('✅ MySQL database connected');
            }

            // Initialize Firebase/Firestore if enabled
            if (this.config.type === 'firestore' || this.config.type === 'hybrid') {
                this.databases.set('firebase', new FirebaseDB(this.config.firebase, this.encryptionService));
                await this.databases.get('firebase').connect();

                if (!this.primaryDb) {
                    this.primaryDb = this.databases.get('firebase');
                }
                this.secondaryDb = this.databases.get('firebase');
                console.log('✅ Firebase database connected');
            }

            // Initialize Azure Cosmos DB if enabled
            if (this.config.type === 'cosmosdb' || this.config.type === 'hybrid-cosmos') {
                this.databases.set('cosmosdb', new CosmosDB(this.config.cosmosdb, this.encryptionService));
                await this.databases.get('cosmosdb').connect();

                if (!this.primaryDb) {
                    this.primaryDb = this.databases.get('cosmosdb');
                }
                if (!this.secondaryDb) {
                    this.secondaryDb = this.databases.get('cosmosdb');
                }
                console.log('✅ Azure Cosmos DB connected');
            }

            this.initialized = true;
            console.log(`🎯 Database adapter initialized successfully`);

        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw new Error(`Database initialization failed: ${error.message}`);
        }
    }

    // Main database operations - compatible with existing codebase
    async postData(tableName, data = {}) {
        await this.ensureInitialized();
        
        try {
            const result = await this.primaryDb.postData(tableName, data);
            
            // Sync to secondary database if hybrid mode
            if (this.secondaryDb && this.config.type === 'hybrid') {
                this._syncToSecondary('postData', tableName, data).catch(err => {
                    console.warn('Secondary database sync failed:', err);
                });
            }
            
            return result;
        } catch (error) {
            console.error(`postData failed for ${tableName}:`, error);
            throw error;
        }
    }

    async getDataByFilters(tableName, filters = {}, options = {}) {
        await this.ensureInitialized();
        
        try {
            return await this.primaryDb.getDataByFilters(tableName, filters, options);
        } catch (error) {
            // Fallback to secondary if available
            if (this.secondaryDb) {
                console.warn('Primary database read failed, trying secondary:', error.message);
                return await this.secondaryDb.getDataByFilters(tableName, filters, options);
            }
            throw error;
        }
    }

    async updateData(tableName, data = {}, whereClause = '', whereParams = []) {
        await this.ensureInitialized();
        
        try {
            const result = await this.primaryDb.updateData(tableName, data, whereClause, whereParams);
            
            // Sync to secondary database if hybrid mode
            if (this.secondaryDb && this.config.type === 'hybrid') {
                this._syncToSecondary('updateData', tableName, data, whereClause, whereParams).catch(err => {
                    console.warn('Secondary database sync failed:', err);
                });
            }
            
            return result;
        } catch (error) {
            console.error(`updateData failed for ${tableName}:`, error);
            throw error;
        }
    }

    async deleteData(tableName, whereClause = '', whereParams = []) {
        await this.ensureInitialized();
        
        try {
            const result = await this.primaryDb.deleteData(tableName, whereClause, whereParams);
            
            // Sync to secondary database if hybrid mode
            if (this.secondaryDb && this.config.type === 'hybrid') {
                this._syncToSecondary('deleteData', tableName, whereClause, whereParams).catch(err => {
                    console.warn('Secondary database sync failed:', err);
                });
            }
            
            return result;
        } catch (error) {
            console.error(`deleteData failed for ${tableName}:`, error);
            throw error;
        }
    }

    // Query builder interface (enhanced MySQL-style queries)
    table(name) {
        if (this.primaryDb && this.primaryDb.table) {
            return this.primaryDb.table(name);
        }
        throw new Error('Query builder not available for current database type');
    }

    // Raw query execution
    async query(sql, params = []) {
        await this.ensureInitialized();
        
        if (this.primaryDb && this.primaryDb.query) {
            return await this.primaryDb.query(sql, params);
        }
        throw new Error('Raw queries not supported for current database type');
    }

    // Transaction support
    async transaction(callback) {
        await this.ensureInitialized();
        
        if (this.primaryDb && this.primaryDb.transaction) {
            return await this.primaryDb.transaction(callback);
        }
        
        // For databases without transaction support, execute directly
        return await callback(this.primaryDb);
    }

    // Real-time subscription support (Firestore only)
    subscribe(tableName, callback, filters = {}) {
        const firebaseDb = this.databases.get('firebase');
        if (firebaseDb && firebaseDb.subscribe) {
            const subscriptionId = `${tableName}_${Date.now()}_${Math.random()}`;
            const unsubscribe = firebaseDb.subscribe(tableName, callback, filters);
            
            this.subscriptions.set(subscriptionId, {
                unsubscribe,
                tableName,
                createdAt: Date.now()
            });
            
            return {
                subscriptionId,
                unsubscribe: () => this.unsubscribe(subscriptionId)
            };
        }
        
        console.warn('Real-time subscriptions require Firebase/Firestore database');
        return { subscriptionId: null, unsubscribe: () => {} };
    }

    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(subscriptionId);
            console.log(`📡 Subscription ${subscriptionId} unsubscribed`);
            return true;
        }
        return false;
    }

    unsubscribeAll() {
        for (const [id, subscription] of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.subscriptions.clear();
        console.log('📡 All subscriptions unsubscribed');
    }

    // Legacy method compatibility
    async getAllUsers() {
        return await this.getDataByFilters(TABLE_NAMES.USERS);
    }

    async insertUser(name, email) {
        return await this.postData(TABLE_NAMES.USERS, { name, email });
    }

    // Validation (forwarded to primary database)
    validate(data, rules) {
        if (this.primaryDb && this.primaryDb.validate) {
            return this.primaryDb.validate(data, rules);
        }
    }

    // Encryption methods (delegated to EncryptionService)
    encrypt(text) {
        return this.encryptionService.encrypt(text);
    }

    decrypt(encryptedText) {
        return this.encryptionService.decrypt(encryptedText);
    }

    // Health check
    async healthCheck() {
        const health = {
            primary: false,
            secondary: false,
            databases: {}
        };

        for (const [name, db] of this.databases) {
            try {
                if (name === 'mysql' && db.query) {
                    await db.query('SELECT 1 as test');
                } else if (name === 'firebase') {
                    // Firebase health check is handled in connect method
                }
                
                health.databases[name] = { 
                    status: 'healthy', 
                    lastCheck: new Date(),
                    type: name === 'mysql' ? 'MySQL' : (db.isFirestore ? 'Firestore' : 'Firebase Realtime')
                };
                
                if (db === this.primaryDb) health.primary = true;
                if (db === this.secondaryDb) health.secondary = true;
                
            } catch (error) {
                health.databases[name] = { 
                    status: 'unhealthy', 
                    error: error.message,
                    lastCheck: new Date()
                };
            }
        }

        return health;
    }

    // Get current configuration
    getConfig() {
        return {
            type: this.config.type,
            primaryDatabase: this.primaryDb ? (this.primaryDb.constructor.name) : null,
            secondaryDatabase: this.secondaryDb ? (this.secondaryDb.constructor.name) : null,
            databases: Array.from(this.databases.keys()),
            isFirestore: this.secondaryDb ? this.secondaryDb.isFirestore : null
        };
    }

    // Close all connections
    async close() {
        console.log('🛑 Closing database adapter...');
        
        // Unsubscribe from all real-time subscriptions
        this.unsubscribeAll();
        
        const promises = [];
        
        for (const [name, db] of this.databases) {
            if (db.close) {
                promises.push(
                    db.close().catch(err => 
                        console.warn(`Failed to close ${name} database:`, err)
                    )
                );
            }
        }

        await Promise.all(promises);
        this.databases.clear();
        this.primaryDb = null;
        this.secondaryDb = null;
        this.initialized = false;
        
        console.log('📚 Database adapter closed successfully');
    }

    // Private methods
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    async _syncToSecondary(method, ...args) {
        if (!this.secondaryDb) return;
        
        try {
            await this.secondaryDb[method](...args);
        } catch (error) {
            console.error(`Secondary sync failed for ${method}:`, error);
            // Could implement retry logic here
        }
    }

    // Static helper methods
    static createMySQLConfig(host, port, user, password, database) {
        return {
            type: 'mysql',
            mysql: { host, port, user, password, database }
        };
    }

    static createFirebaseConfig(projectId, serviceAccountKey, useFirestore = true) {
        return {
            type: 'firestore',
            firebase: { projectId, serviceAccountKey, useFirestore }
        };
    }

    static createCosmosConfig(connectionString, database) {
        return {
            type: 'cosmosdb',
            cosmosdb: { connectionString, database }
        };
    }

    static createCosmosConfigFromCredentials(accountName, accountKey, database) {
        return {
            type: 'cosmosdb',
            cosmosdb: { accountName, accountKey, database }
        };
    }

    static createHybridConfig(mysqlConfig, firebaseConfig) {
        return {
            type: 'hybrid',
            mysql: mysqlConfig,
            firebase: firebaseConfig
        };
    }

    static createHybridCosmosConfig(mysqlConfig, cosmosConfig) {
        return {
            type: 'hybrid-cosmos',
            mysql: mysqlConfig,
            cosmosdb: cosmosConfig
        };
    }
}

// Singleton pattern for easy integration with existing modules
let instance = null;

module.exports = {
    DatabaseAdapter,
    getInstance: (encryptionService, config = {}) => {
        if (!instance) {
            if (!encryptionService) {
                throw new Error('EncryptionService is required for first call to getInstance');
            }
            instance = new DatabaseAdapter(encryptionService, config);
        }
        return instance;
    },
    resetInstance: () => {
        if (instance && instance.initialized) {
            instance.close();
        }
        instance = null;
    },
    // Export helper methods
    createMySQLConfig: DatabaseAdapter.createMySQLConfig,
    createFirebaseConfig: DatabaseAdapter.createFirebaseConfig,
    createCosmosConfig: DatabaseAdapter.createCosmosConfig,
    createCosmosConfigFromCredentials: DatabaseAdapter.createCosmosConfigFromCredentials,
    createHybridConfig: DatabaseAdapter.createHybridConfig,
    createHybridCosmosConfig: DatabaseAdapter.createHybridCosmosConfig
};