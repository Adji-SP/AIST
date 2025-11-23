// App/modules/lib/client/websocketClient.js
// Clean WebSocket/Realtime client - Works in browser

/**
 * WebSocket Client - Clean abstraction for real-time WebSocket connections
 * Handles subscriptions, reconnection, and message routing
 */
class WebSocketClient {
    constructor(config = {}) {
        this.config = {
            url: config.url || process.env.REACT_APP_WS_URL || `ws://localhost:${process.env.WEBSOCKET_PORT || 8080}`,
            reconnectDelay: config.reconnectDelay || 5000,
            maxReconnectAttempts: config.maxReconnectAttempts || 5,
            heartbeatInterval: config.heartbeatInterval || 30000,
            debug: config.debug || false,
            ...config
        };

        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.heartbeatTimer = null;
        this.subscriptions = new Map(); // topic -> Set of callbacks
        this.eventListeners = new Map(); // event -> Set of callbacks
        this.messageQueue = []; // Queue messages when disconnected
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            this._log('Already connected or connecting');
            return;
        }

        try {
            this._log('Connecting to WebSocket server:', this.config.url);
            this.ws = new WebSocket(this.config.url);

            this.ws.onopen = () => this._handleOpen();
            this.ws.onclose = (event) => this._handleClose(event);
            this.ws.onerror = (error) => this._handleError(error);
            this.ws.onmessage = (event) => this._handleMessage(event);

        } catch (error) {
            this._log('Connection error:', error);
            this._emit('error', error);
            this._scheduleReconnect();
        }
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        this._log('Disconnecting...');
        this.reconnectAttempts = this.config.maxReconnectAttempts; // Prevent reconnection

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }

        this.connected = false;
        this._emit('disconnected');
    }

    /**
     * Subscribe to a topic (e.g., 'sensor_data', 'tasks', etc.)
     * @param {string} topic - Topic name
     * @param {string} filter - Optional filter (e.g., site_id)
     * @param {number} interval - Update interval in ms
     */
    subscribe(topic, filter = null, interval = 30000) {
        const message = {
            type: 'subscribe',
            topic,
            filter,
            interval
        };

        this._send(message);
        this._log('Subscribed to:', topic, filter ? `(filter: ${filter})` : '');
    }

    /**
     * Unsubscribe from a topic
     */
    unsubscribe(topic, filter = null) {
        const message = {
            type: 'unsubscribe',
            topic,
            filter
        };

        this._send(message);
        this._log('Unsubscribed from:', topic);
    }

    /**
     * Listen for specific events (e.g., 'sensor_data_update', 'task_update')
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
        this._log('Registered listener for:', event);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
            if (this.eventListeners.get(event).size === 0) {
                this.eventListeners.delete(event);
            }
        }
    }

    /**
     * Send data to server
     */
    send(data) {
        const message = {
            type: 'data',
            data
        };
        this._send(message);
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            connected: this.connected,
            reconnectAttempts: this.reconnectAttempts,
            url: this.config.url
        };
    }

    // ============= Private Methods =============

    _handleOpen() {
        this._log('Connected to WebSocket server');
        this.connected = true;
        this.reconnectAttempts = 0;

        // Send queued messages
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.ws.send(message);
        }

        // Start heartbeat
        this._startHeartbeat();

        this._emit('connected');
    }

    _handleClose(event) {
        this._log('WebSocket closed:', event.code, event.reason);
        this.connected = false;
        this.ws = null;

        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        this._emit('disconnected', { code: event.code, reason: event.reason });

        // Attempt reconnection if not intentional
        if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this._scheduleReconnect();
        }
    }

    _handleError(error) {
        this._log('WebSocket error:', error);
        this._emit('error', error);
    }

    _handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            this._log('Received message:', message.type);

            // Emit specific event
            if (message.type) {
                this._emit(message.type, message.data || message);
            }

            // Emit generic message event
            this._emit('message', message);

        } catch (error) {
            this._log('Failed to parse message:', error);
        }
    }

    _send(message) {
        const jsonMessage = JSON.stringify(message);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(jsonMessage);
        } else {
            // Queue message for later
            this.messageQueue.push(jsonMessage);
            this._log('Message queued (not connected)');
        }
    }

    _scheduleReconnect() {
        if (this.reconnectTimer) return;
        if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            this._log('Max reconnection attempts reached');
            this._emit('reconnect_failed');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.config.reconnectDelay;

        this._log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);
        this._emit('reconnecting', { attempt: this.reconnectAttempts, delay });

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    _startHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }

        this.heartbeatTimer = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this._send({ type: 'ping' });
            }
        }, this.config.heartbeatInterval);
    }

    _emit(event, data = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    this._log('Error in event listener:', error);
                }
            });
        }
    }

    _log(...args) {
        if (this.config.debug) {
            console.log('[WebSocketClient]', ...args);
        }
    }

    /**
     * Cleanup all resources
     */
    cleanup() {
        this.disconnect();
        this.eventListeners.clear();
        this.subscriptions.clear();
        this.messageQueue = [];
    }
}

// Singleton instance
let wsClientInstance = null;

/**
 * Get or create WebSocket client instance
 */
export function getWebSocketClient(config = null) {
    if (!wsClientInstance) {
        wsClientInstance = new WebSocketClient(config);
        // Auto-connect
        wsClientInstance.connect();
    }
    return wsClientInstance;
}

export default WebSocketClient;
