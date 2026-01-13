// src/services/dataService.js
// Unified Data Service - Mode-aware data access layer

import ipcService from './ipc';
import apiService from './api';

class DataService {
    constructor() {
        // Auto-detect mode
        this.mode = this._detectMode();
        console.log(`📡 DataService initialized in ${this.mode} mode`);
    }

    _detectMode() {
        // Check if running in Electron
        if (ipcService.isAvailable()) {
            return 'electron';
        }
        // Otherwise, use REST API
        return 'api';
    }

    /**
     * Get the appropriate service based on mode
     */
    _getService() {
        return this.mode === 'electron' ? ipcService : apiService;
    }

    // === Database Operations ===

    /**
     * Get data by filters
     * @param {string} table - Table name
     * @param {object} filters - Filter conditions
     * @param {object} options - Query options (limit, orderBy, etc.)
     */
    async getDataByFilters(table, filters = {}, options = {}) {
        const service = this._getService();
        const result = await service.getDataByFilters(table, filters, options);

        // Handle response format differences
        if (result.success !== undefined) {
            return result.success ? result.data : [];
        }
        return result;
    }

    /**
     * Insert data into table
     * Benefits from backend DatabaseService:
     * - Automatic encryption for sensitive fields
     * - Automatic validation
     * - Automatic event emission (EventBus)
     */
    async insertData(table, data) {
        const service = this._getService();
        return await service.insertData(table, data);
    }

    /**
     * Update data in table
     */
    async updateData(table, data, whereClause, whereParams) {
        const service = this._getService();
        return await service.updateData(table, data, whereClause, whereParams);
    }

    /**
     * Delete data from table
     */
    async deleteData(table, whereClause, whereParams) {
        const service = this._getService();
        return await service.deleteData(table, whereClause, whereParams);
    }

    // === Sensor Data (convenience methods) ===

    async getSensorData(filters = {}) {
        return await this.getDataByFilters('sensor_data', filters, {
            orderBy: 'timestamp',
            orderDirection: 'DESC'
        });
    }

    async insertSensorData(data) {
        return await this.insertData('sensor_data', {
            ...data,
            timestamp: new Date().toISOString()
        });
    }

    // === Serial Operations (Electron only) ===

    async getSerialStatus() {
        if (this.mode !== 'electron') {
            throw new Error('Serial operations only available in Electron mode');
        }
        return await ipcService.getSerialStatus();
    }

    async serialForceReconnect() {
        if (this.mode !== 'electron') {
            throw new Error('Serial operations only available in Electron mode');
        }
        return await ipcService.serialForceReconnect();
    }

    // === Database Health ===

    async checkDatabaseConnection() {
        if (this.mode === 'electron') {
            return await ipcService.checkDatabaseConnection();
        } else {
            try {
                await apiService.healthCheck();
                return true;
            } catch {
                return false;
            }
        }
    }

    // === Mode Info ===

    getMode() {
        return this.mode;
    }

    isElectronMode() {
        return this.mode === 'electron';
    }
}

export default new DataService();
