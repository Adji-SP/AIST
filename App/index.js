/**
 * Framework-Agnostic Backend Entry Point
 *
 * This is the main entry point for the modular backend.
 * It can be used in any JavaScript project regardless of framework.
 *
 * Usage Examples:
 *
 * // Electron
 * const App = require('./App');
 * await App.bootstrap({ mode: 'electron', electron: { app, window } });
 *
 * // Express
 * const App = require('./App');
 * await App.bootstrap({ mode: 'express', modules: { api: true, database: true } });
 *
 * // Standalone
 * const App = require('./App');
 * await App.bootstrap({ mode: 'standalone' });
 */

// Core bootstrap system
const bootstrap = require('./bootstrap');
const config = require('./config');

// Module managers (for direct access if needed)
const DatabaseManager = require('./modules/manager/database/databaseManager');
const APIServer = require('./modules/manager/api/apiServer');
const SerialManager = require('./modules/manager/serial/serialManager');
const IPCManager = require('./modules/manager/ipc/ipcManager');
const WebsocketManager = require('./modules/manager/websocket/websocketManager');

// Libraries (for frontend/client usage)
const lib = {
    alert: require('./modules/lib/alert'),
    client: require('./modules/lib/client'),
    db: {
        cosmosDB: require('./modules/lib/db/cosmosDB'),
        databaseAdapter: require('./modules/lib/db/databaseAdapter'),
        firebaseDB: require('./modules/lib/db/firebaseDB'),
        mysqlDB: require('./modules/lib/db/mysqlDB')
    },
    com: {
        serialCommunicator: require('./modules/lib/com/serialCommunicator'),
        webSocketCommunicator: require('./modules/lib/com/webSocketCommunicator')
    }
};

// Controllers (HTTP endpoints)
const controllers = {
    auth: require('./Http/Controllers/authController'),
    database: require('./Http/Controllers/databaseController'),
    maui: require('./Http/Controllers/mauiController')
};

/**
 * Main App object - provides clean API for backend usage
 */
const App = {
    // Bootstrap methods
    bootstrap: bootstrap.bootstrap.bind(bootstrap),
    shutdown: bootstrap.shutdown.bind(bootstrap),
    isReady: bootstrap.isReady.bind(bootstrap),
    getMode: bootstrap.getMode.bind(bootstrap),

    // Module access
    getModule: bootstrap.getModule.bind(bootstrap),
    get database() { return bootstrap.databaseManager; },
    get api() { return bootstrap.apiServer; },
    get serial() { return bootstrap.serialManager; },
    get ipc() { return bootstrap.ipcManager; },
    get websocket() { return bootstrap.websocketManager; },
    get window() { return bootstrap.windowManager; },

    // Configuration
    config,

    // Libraries for client-side usage
    lib,

    // Controllers
    controllers,

    // Direct access to managers (for advanced usage)
    managers: {
        DatabaseManager,
        APIServer,
        SerialManager,
        IPCManager,
        WebsocketManager
    },

    // Event system (inherited from bootstrap)
    on: bootstrap.on.bind(bootstrap),
    off: bootstrap.off.bind(bootstrap),
    once: bootstrap.once.bind(bootstrap),
    emit: bootstrap.emit.bind(bootstrap)
};

// Export the App object
module.exports = App;

// Named exports for ES6 import
module.exports.default = App;
module.exports.config = config;
module.exports.lib = lib;
module.exports.controllers = controllers;
module.exports.managers = {
    DatabaseManager,
    APIServer,
    SerialManager,
    IPCManager,
    WebsocketManager
};
// Export bootstrap instance separately (not as App.bootstrap to avoid conflict)
module.exports.bootstrapInstance = bootstrap;
