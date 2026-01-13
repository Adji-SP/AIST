/**
 * DatabaseService - Facade for Database Operations
 *
 * Provides a simplified, consistent interface to database operations across
 * all database types (MySQL, Firestore, Cosmos DB). Hides complexity and
 * provides a stable API for the application layer.
 *
 * Benefits:
 * - Single source of truth for database operations
 * - Abstracts away database implementation details
 * - Easy to mock for testing
 * - Consistent error handling
 * - Validation at the service boundary
 */

const { TABLE_NAMES } = require('../../../config/constants');
const { getInstance: getEventBus } = require('../events/EventBus');

class DatabaseService {
    constructor(databaseAdapter, validationService = null) {
        if (!databaseAdapter) {
            throw new Error('DatabaseAdapter is required for DatabaseService');
        }

        this.db = databaseAdapter;
        this.validationService = validationService;
        this.eventBus = getEventBus();
    }

    /**
     * Insert data into a table
     * @param {string} tableName - Table name (use TABLE_NAMES constants)
     * @param {Object} data - Data to insert
     * @param {Object} options - Options (validate, emit)
     * @returns {Promise<Object>} Insert result
     */
    async insert(tableName, data, options = {}) {
        const { validate = true, emit = true } = options;

        try {
            // Validate if validation service is available
            if (validate && this.validationService) {
                const validation = this.validationService.validateTableData(tableName, data);
                if (!validation.valid) {
                    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
                }
            }

            // Insert data
            const result = await this.db.postData(tableName, data);

            // Emit event
            if (emit) {
                this.eventBus.emit('data:saved', { tableName, data, result });
            }

            return { success: true, data: result };
        } catch (error) {
            if (emit) {
                this.eventBus.emit('data:error', { tableName, operation: 'insert', error });
            }
            throw error;
        }
    }

    /**
     * Find records by filters
     * @param {string} tableName - Table name
     * @param {Object} filters - Filter criteria
     * @param {Object} options - Query options (limit, orderBy, etc.)
     * @returns {Promise<Array>} Array of records
     */
    async find(tableName, filters = {}, options = {}) {
        try {
            const result = await this.db.getDataByFilters(tableName, filters, options);
            return Array.isArray(result) ? result : [];
        } catch (error) {
            this.eventBus.emit('data:error', { tableName, operation: 'find', error });
            throw error;
        }
    }

    /**
     * Find a single record by ID
     * @param {string} tableName - Table name
     * @param {string|number} id - Record ID
     * @returns {Promise<Object|null>} Record or null
     */
    async findById(tableName, id) {
        try {
            const results = await this.find(tableName, { id }, { limit: 1 });
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            this.eventBus.emit('data:error', { tableName, operation: 'findById', error });
            throw error;
        }
    }

    /**
     * Update records
     * @param {string} tableName - Table name
     * @param {Object} data - Data to update
     * @param {string} whereClause - WHERE clause
     * @param {Array} whereParams - WHERE parameters
     * @returns {Promise<Object>} Update result
     */
    async update(tableName, data, whereClause, whereParams = []) {
        try {
            const result = await this.db.updateData(tableName, data, whereClause, whereParams);
            this.eventBus.emit('data:updated', { tableName, data, whereClause });
            return { success: true, data: result };
        } catch (error) {
            this.eventBus.emit('data:error', { tableName, operation: 'update', error });
            throw error;
        }
    }

    /**
     * Delete records
     * @param {string} tableName - Table name
     * @param {string} whereClause - WHERE clause
     * @param {Array} whereParams - WHERE parameters
     * @returns {Promise<Object>} Delete result
     */
    async delete(tableName, whereClause, whereParams = []) {
        try {
            const result = await this.db.deleteData(tableName, whereClause, whereParams);
            this.eventBus.emit('data:deleted', { tableName, whereClause });
            return { success: true, data: result };
        } catch (error) {
            this.eventBus.emit('data:error', { tableName, operation: 'delete', error });
            throw error;
        }
    }

    /**
     * Count records
     * @param {string} tableName - Table name
     * @param {Object} filters - Filter criteria
     * @returns {Promise<number>} Record count
     */
    async count(tableName, filters = {}) {
        try {
            if (this.db.table) {
                // Use query builder if available
                return await this.db.table(tableName).where(filters).count();
            } else {
                // Fallback to getDataByFilters
                const results = await this.db.getDataByFilters(tableName, filters);
                return results.length;
            }
        } catch (error) {
            this.eventBus.emit('data:error', { tableName, operation: 'count', error });
            throw error;
        }
    }

    /**
     * Execute a transaction
     * @param {Function} callback - Transaction callback
     * @returns {Promise<any>} Transaction result
     */
    async transaction(callback) {
        return await this.db.transaction(callback);
    }

    /**
     * Health check
     * @returns {Promise<Object>} Health status
     */
    async healthCheck() {
        try {
            if (this.db.healthCheck) {
                return await this.db.healthCheck();
            }
            return { status: 'unknown' };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    /**
     * Get database configuration
     * @returns {Object} Configuration
     */
    getConfig() {
        return this.db.getConfig ? this.db.getConfig() : {};
    }

    /**
     * Subscribe to real-time updates (Firestore only)
     * @param {string} tableName - Table name
     * @param {Function} callback - Callback function
     * @param {Object} filters - Filter criteria
     * @returns {Object} Subscription object
     */
    subscribe(tableName, callback, filters = {}) {
        if (this.db.subscribe) {
            return this.db.subscribe(tableName, callback, filters);
        }
        console.warn('Real-time subscriptions not supported by current database');
        return { subscriptionId: null, unsubscribe: () => {} };
    }

    /**
     * Access underlying database adapter (for advanced use cases)
     * @returns {DatabaseAdapter} Database adapter
     */
    getAdapter() {
        return this.db;
    }
}

module.exports = DatabaseService;
