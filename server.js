/**
 * Standalone Web Server Entry Point
 *
 * This file bootstraps the backend for web/standalone mode.
 * Uses the framework-agnostic App module.
 */

require('dotenv').config();
const App = require('./App');

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await App.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await App.shutdown();
    process.exit(0);
});

// Uncaught exception handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Bootstrap the backend
async function startServer() {
    try {
        console.log('Starting backend server...');

        // Bootstrap in standalone/express mode
        await App.bootstrap({
            mode: 'express',
            modules: {
                database: true,
                api: true,
                serial: false,      // Serial port not available in web mode
                websocket: true,
                ipc: false,         // IPC only for Electron
                window: false       // Window only for Electron
            }
        });

        console.log('Backend server started successfully');
        console.log(`API Server: http://localhost:${process.env.API_PORT || 3001}`);
        console.log(`WebSocket Server: ws://localhost:${process.env.WEBSOCKET_PORT || 8080}`);

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
