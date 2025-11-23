// App/modules/lib/client/apiClient.js
// Clean API client library - Shared between frontend and backend

/**
 * API Client - Handles HTTP requests to backend API
 */
class ApiClient {
    constructor(baseUrl = null) {
        this.baseUrl = baseUrl || process.env.REACT_APP_API_URL || `http://localhost:${process.env.API_PORT || 3001}`;
    }

    /**
     * Generic HTTP request method
     * @private
     */
    async _request(endpoint, options = {}) {
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

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this._request(url, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return this._request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        return this._request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this._request(endpoint, { method: 'DELETE' });
    }

    // === Sensor Data API ===

    async getSensorData(filters = {}) {
        return this.get('/api/sensor-data', filters);
    }

    async insertSensorData(data) {
        return this.post('/api/sensor-data', data);
    }

    // === Database API ===

    async getDataByFilters(table, filters = {}, options = {}) {
        return this.post('/api/data/query', { table, filters, options });
    }

    async insertData(table, data) {
        return this.post('/api/data/insert', { table, data });
    }

    async updateData(table, id, data) {
        return this.put(`/api/data/${table}/${id}`, data);
    }

    async deleteData(table, id) {
        return this.delete(`/api/data/${table}/${id}`);
    }

    // === Health Check ===

    async healthCheck() {
        return this.get('/api/health');
    }
}

// Singleton instance
let apiClientInstance = null;

/**
 * Get or create API client instance
 */
export function getApiClient(baseUrl = null) {
    if (!apiClientInstance) {
        apiClientInstance = new ApiClient(baseUrl);
    }
    return apiClientInstance;
}

export default ApiClient;
