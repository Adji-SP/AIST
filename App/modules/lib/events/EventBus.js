/**
 * EventBus - Central Event Management System
 *
 * A publish-subscribe event bus that allows modules to communicate without
 * direct dependencies. Modules publish events and subscribe to events they care about.
 *
 * Benefits:
 * - Decouples modules from each other
 * - Single source of truth for event flow
 * - Easy to trace event paths
 * - Testable (can mock the bus)
 * - Type-safe with event constants
 *
 * Usage:
 *   const eventBus = EventBus.getInstance();
 *
 *   // Subscribe to an event
 *   eventBus.on('data:received', (data) => {
 *       console.log('Data received:', data);
 *   });
 *
 *   // Publish an event
 *   eventBus.emit('data:received', { temp: 25 });
 *
 *   // Unsubscribe
 *   eventBus.off('data:received', handler);
 */

const EventEmitter = require('events');
const { EVENTS } = require('../../../config/constants');

class EventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50); // Increase default limit for complex applications
        this.subscriptions = new Map(); // Track subscriptions for debugging
        this.eventHistory = []; // Store recent events for debugging
        this.maxHistorySize = 100;
        this.debugMode = process.env.DEBUG_EVENTBUS === 'true';
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Event name (use constants from EVENTS)
     * @param {Function} handler - Event handler function
     * @param {Object} options - Subscription options
     * @returns {string} Subscription ID for unsubscribing
     */
    on(eventName, handler, options = {}) {
        const { once = false, priority = 'normal', namespace = null } = options;

        // Validate handler
        if (typeof handler !== 'function') {
            throw new Error('Event handler must be a function');
        }

        // Create subscription metadata
        const subscriptionId = this._generateSubscriptionId();
        const subscription = {
            id: subscriptionId,
            eventName,
            handler,
            once,
            priority,
            namespace,
            subscribedAt: new Date(),
        };

        // Store subscription metadata
        if (!this.subscriptions.has(eventName)) {
            this.subscriptions.set(eventName, []);
        }
        this.subscriptions.get(eventName).push(subscription);

        // Register with EventEmitter
        if (once) {
            super.once(eventName, handler);
        } else {
            super.on(eventName, handler);
        }

        if (this.debugMode) {
            console.log(`[EventBus] Subscribed to '${eventName}' (ID: ${subscriptionId})`);
        }

        return subscriptionId;
    }

    /**
     * Subscribe to an event (alias for on)
     */
    subscribe(eventName, handler, options) {
        return this.on(eventName, handler, options);
    }

    /**
     * Subscribe to an event once
     */
    once(eventName, handler) {
        return this.on(eventName, handler, { once: true });
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Event name
     * @param {Function|string} handlerOrId - Handler function or subscription ID
     */
    off(eventName, handlerOrId) {
        if (typeof handlerOrId === 'string') {
            // Unsubscribe by subscription ID
            const subscriptions = this.subscriptions.get(eventName);
            if (subscriptions) {
                const subscription = subscriptions.find(sub => sub.id === handlerOrId);
                if (subscription) {
                    super.off(eventName, subscription.handler);
                    this.subscriptions.set(
                        eventName,
                        subscriptions.filter(sub => sub.id !== handlerOrId)
                    );
                    if (this.debugMode) {
                        console.log(`[EventBus] Unsubscribed from '${eventName}' (ID: ${handlerOrId})`);
                    }
                }
            }
        } else {
            // Unsubscribe by handler function
            super.off(eventName, handlerOrId);

            const subscriptions = this.subscriptions.get(eventName);
            if (subscriptions) {
                this.subscriptions.set(
                    eventName,
                    subscriptions.filter(sub => sub.handler !== handlerOrId)
                );
            }
            if (this.debugMode) {
                console.log(`[EventBus] Unsubscribed from '${eventName}'`);
            }
        }
    }

    /**
     * Unsubscribe from an event (alias for off)
     */
    unsubscribe(eventName, handlerOrId) {
        this.off(eventName, handlerOrId);
    }

    /**
     * Emit an event
     * @param {string} eventName - Event name (use constants from EVENTS)
     * @param {*} data - Event data
     */
    emit(eventName, ...args) {
        // Record event in history for debugging
        if (this.eventHistory.length >= this.maxHistorySize) {
            this.eventHistory.shift();
        }
        this.eventHistory.push({
            eventName,
            timestamp: new Date(),
            args: args.length === 1 ? args[0] : args,
        });

        if (this.debugMode) {
            console.log(`[EventBus] Emitting '${eventName}'`, args.length > 0 ? args[0] : '');
        }

        // Emit event
        return super.emit(eventName, ...args);
    }

    /**
     * Publish an event (alias for emit)
     */
    publish(eventName, ...args) {
        return this.emit(eventName, ...args);
    }

    /**
     * Remove all listeners for an event
     * @param {string} eventName - Event name
     */
    removeAllListeners(eventName) {
        if (eventName) {
            this.subscriptions.delete(eventName);
        } else {
            this.subscriptions.clear();
        }
        return super.removeAllListeners(eventName);
    }

    /**
     * Get all subscriptions for an event
     * @param {string} eventName - Event name
     * @returns {Array} Array of subscription metadata
     */
    getSubscriptions(eventName) {
        return this.subscriptions.get(eventName) || [];
    }

    /**
     * Get all active event names
     * @returns {Array<string>} Array of event names
     */
    getActiveEvents() {
        return Array.from(this.subscriptions.keys());
    }

    /**
     * Get listener count for an event
     * @param {string} eventName - Event name
     * @returns {number} Number of listeners
     */
    getListenerCount(eventName) {
        return this.listenerCount(eventName);
    }

    /**
     * Get event history (for debugging)
     * @param {number} limit - Maximum number of events to return
     * @returns {Array} Recent events
     */
    getEventHistory(limit = 20) {
        return this.eventHistory.slice(-limit);
    }

    /**
     * Clear event history
     */
    clearHistory() {
        this.eventHistory = [];
    }

    /**
     * Get statistics about the event bus
     * @returns {Object} Statistics
     */
    getStats() {
        const stats = {
            totalSubscriptions: 0,
            activeEvents: this.getActiveEvents().length,
            eventHistory: this.eventHistory.length,
            subscriptionsByEvent: {},
        };

        for (const [eventName, subscriptions] of this.subscriptions) {
            stats.subscriptionsByEvent[eventName] = subscriptions.length;
            stats.totalSubscriptions += subscriptions.length;
        }

        return stats;
    }

    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Enable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[EventBus] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Wait for an event to be emitted
     * @param {string} eventName - Event name
     * @param {number} timeout - Timeout in milliseconds (0 = no timeout)
     * @returns {Promise} Promise that resolves when event is emitted
     */
    waitFor(eventName, timeout = 0) {
        return new Promise((resolve, reject) => {
            let timeoutId = null;

            const handler = (...args) => {
                if (timeoutId) clearTimeout(timeoutId);
                resolve(args.length === 1 ? args[0] : args);
            };

            this.once(eventName, handler);

            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    this.off(eventName, handler);
                    reject(new Error(`Timeout waiting for event: ${eventName}`));
                }, timeout);
            }
        });
    }

    /**
     * Create a namespaced event bus
     * @param {string} namespace - Namespace prefix
     * @returns {Object} Namespaced event bus interface
     */
    namespace(namespace) {
        return {
            on: (event, handler, options = {}) =>
                this.on(`${namespace}:${event}`, handler, { ...options, namespace }),
            emit: (event, ...args) =>
                this.emit(`${namespace}:${event}`, ...args),
            off: (event, handler) =>
                this.off(`${namespace}:${event}`, handler),
            once: (event, handler) =>
                this.once(`${namespace}:${event}`, handler),
        };
    }

    /**
     * Generate a unique subscription ID
     * @private
     */
    _generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Destroy the event bus (cleanup)
     */
    destroy() {
        this.removeAllListeners();
        this.subscriptions.clear();
        this.eventHistory = [];
        if (this.debugMode) {
            console.log('[EventBus] Destroyed');
        }
    }
}

// Singleton instance
let instance = null;

/**
 * Get the EventBus singleton instance
 * @returns {EventBus} EventBus instance
 */
function getInstance() {
    if (!instance) {
        instance = new EventBus();
    }
    return instance;
}

/**
 * Reset the singleton instance (for testing)
 */
function resetInstance() {
    if (instance) {
        instance.destroy();
        instance = null;
    }
}

// Export singleton interface
module.exports = {
    EventBus,
    getInstance,
    resetInstance,

    // Convenience exports
    get instance() {
        return getInstance();
    },
};
