// src/services/ipc.js
// IPC Service - Wraps Electron IPC calls (window.api from preload.js)

class IpcService {
    constructor() {
        this.ipc = window.api;
        this.isElectron = !!window.api;
    }

    /**
     * Check if running in Electron
     */
    isAvailable() {
        return this.isElectron;
    }

    /**
     * Generic IPC invoke
     */
    async invoke(channel, ...args) {
        if (!this.isElectron) {
            throw new Error('IPC is only available in Electron mode');
        }
        return await this.ipc.invoke(channel, ...args);
    }

    // === Database Operations ===

    async getDataByFilters(table, filters = {}, options = {}) {
        return await this.ipc.getDataByFilters(table, filters, options);
    }

    async insertData(table, data) {
        return await this.ipc.insertData(table, data);
    }

    async updateData(table, data, whereClause, whereParams) {
        return await this.ipc.updateData(table, data, whereClause, whereParams);
    }

    async deleteData(table, whereClause, whereParams) {
        return await this.ipc.deleteData(table, whereClause, whereParams);
    }

    // === Serial Operations ===

    async getSerialStatus() {
        return await this.invoke('serial-get-status');
    }

    async serialForceReconnect() {
        return await this.invoke('serial-force-reconnect');
    }

    async serialDisconnect() {
        return await this.invoke('serial-disconnect');
    }

    async serialSendData(data) {
        return await this.invoke('serial-send-data', data);
    }

    // === Database Health ===

    async checkDatabaseConnection() {
        return await this.invoke('check-database-connection');
    }

    async getDatabaseConfig() {
        return await this.invoke('db-get-config');
    }

    async getDatabaseHealth() {
        return await this.invoke('db-health-check');
    }

    // === Sensor Data (monitoring specific) ===

    async getTemperatureData(limit = 50) {
        return await this.invoke('get-temperature-data', limit);
    }

    async getPressureData(limit = 50) {
        return await this.invoke('get-pressure-data', limit);
    }

    async getRecordCount(type) {
        return await this.invoke('get-record-count', type);
    }

    async insertTemperatureData(data) {
        return await this.invoke('insert-temperature-data', data);
    }

    async insertPressureData(data) {
        return await this.invoke('insert-pressure-data', data);
    }
}

export default new IpcService();
