/**
 * Electron Main Process Entry Point
 *
 * This file now uses the framework-agnostic App module
 * for cleaner, more maintainable code.
 */

require('dotenv').config();
const { app, BrowserWindow } = require('electron');
const App = require('./App');

// Electron event handlers
app.whenReady().then(async () => {
    try {
        // Bootstrap the backend in Electron mode with all modules
        await App.bootstrap({
            mode: 'electron',
            modules: {
                database: true,
                window: true,
                api: true,
                serial: true,
                websocket: true,
                ipc: true
            },
            electron: {
                app: app
            }
        });

        console.log('Electron application initialized successfully');
    } catch (error) {
        console.error("Failed to initialize application:", error);
        app.quit();
    }
});

app.on('window-all-closed', async () => {
    try {
        await App.shutdown();
    } catch (error) {
        console.error("Error during cleanup:", error);
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        App.bootstrap({
            mode: 'electron',
            modules: {
                database: true,
                window: true,
                api: true,
                serial: true,
                websocket: true,
                ipc: true
            },
            electron: {
                app: app
            }
        });
    }
});