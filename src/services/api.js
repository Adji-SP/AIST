// src/services/api.js
// REST API Service - For standalone mode (no Electron)

class ApiService {
    constructor() {
        this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    }

    async _fetch(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // === Database Operations ===

    async getDataByFilters(table, filters = {}, options = {}) {
        return await this._fetch('/api/data/query', {
            method: 'POST',
            body: JSON.stringify({ table, filters, options })
        });
    }

    async insertData(table, data) {
        return await this._fetch('/api/data/insert', {
            method: 'POST',
            body: JSON.stringify({ table, data })
        });
    }

    async updateData(table, data, whereClause, whereParams) {
        return await this._fetch('/api/data/update', {
            method: 'PUT',
            body: JSON.stringify({ table, data, whereClause, whereParams })
        });
    }

    async deleteData(table, whereClause, whereParams) {
        return await this._fetch('/api/data/delete', {
            method: 'DELETE',
            body: JSON.stringify({ table, whereClause, whereParams })
        });
    }

    // === Sensor Data ===

    async getSensorData(filters = {}) {
        return await this._fetch('/api/sensor-data', {
            method: 'GET',
            params: filters
        });
    }

    async insertSensorData(data) {
        return await this._fetch('/api/sensor-data', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // === Health Check ===

    async healthCheck() {
        return await this._fetch('/api/health');
    }
}

export default new ApiService();
