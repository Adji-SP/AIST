/**
 * Framework Integration Fixes Verification
 *
 * Verifies that all managers now properly use:
 * - EventBus integration
 * - LoggingService
 * - LifecycleManager (where applicable)
 * - DatabaseService (where applicable)
 */

const path = require('path');
const fs = require('fs');

console.log('========================================');
console.log('FRAMEWORK INTEGRATION FIXES VERIFICATION');
console.log('========================================\n');

let testsPassed = 0;
let testsFailed = 0;
const categories = {
    'DatabaseManager': { passed: 0, failed: 0 },
    'APIServer': { passed: 0, failed: 0 },
    'SerialManager': { passed: 0, failed: 0 },
    'WebSocketManager': { passed: 0, failed: 0 },
    'WindowManager': { passed: 0, failed: 0 },
    'IPCManager': { passed: 0, failed: 0 }
};

function test(category, description, fn) {
    try {
        fn();
        console.log(`✅ ${category}: ${description}`);
        testsPassed++;
        categories[category].passed++;
    } catch (error) {
        console.error(`❌ ${category}: ${description}`);
        console.error(`   Error: ${error.message}`);
        testsFailed++;
        categories[category].failed++;
    }
}

console.log('1. DatabaseManager Integration');
console.log('================================\n');

test('DatabaseManager', 'Imports EventBus', () => {
    const dbManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'database', 'databaseManager.js');
    const content = fs.readFileSync(dbManagerPath, 'utf8');
    if (!content.includes("require('../../lib/events/EventBus')")) {
        throw new Error('EventBus not imported');
    }
});

test('DatabaseManager', 'Imports LoggingService', () => {
    const dbManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'database', 'databaseManager.js');
    const content = fs.readFileSync(dbManagerPath, 'utf8');
    if (!content.includes("require('../../lib/services/LoggingService')")) {
        throw new Error('LoggingService not imported');
    }
});

test('DatabaseManager', 'Initializes EventBus in constructor', () => {
    const dbManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'database', 'databaseManager.js');
    const content = fs.readFileSync(dbManagerPath, 'utf8');
    if (!content.includes('this.eventBus = getEventBus()')) {
        throw new Error('EventBus not initialized');
    }
});

test('DatabaseManager', 'Initializes LoggingService in constructor', () => {
    const dbManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'database', 'databaseManager.js');
    const content = fs.readFileSync(dbManagerPath, 'utf8');
    if (!content.includes('this.logger = getLogger()')) {
        throw new Error('Logger not initialized');
    }
});

test('DatabaseManager', 'Emits database:ready event', () => {
    const dbManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'database', 'databaseManager.js');
    const content = fs.readFileSync(dbManagerPath, 'utf8');
    if (!content.includes("this.eventBus.emit('database:ready'")) {
        throw new Error('database:ready event not emitted');
    }
});

test('DatabaseManager', 'Uses logger for initialization', () => {
    const dbManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'database', 'databaseManager.js');
    const content = fs.readFileSync(dbManagerPath, 'utf8');
    if (!content.includes("this.logger.info('Initializing database manager'")) {
        throw new Error('Logger not used for initialization');
    }
});

console.log('\n2. APIServer Integration');
console.log('========================\n');

test('APIServer', 'Extends LifecycleManager', () => {
    const apiServerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'api', 'apiServer.js');
    const content = fs.readFileSync(apiServerPath, 'utf8');
    if (!content.includes('class APIServer extends LifecycleManager')) {
        throw new Error('APIServer does not extend LifecycleManager');
    }
});

test('APIServer', 'Imports EventBus and LoggingService', () => {
    const apiServerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'api', 'apiServer.js');
    const content = fs.readFileSync(apiServerPath, 'utf8');
    if (!content.includes("require('../../lib/events/EventBus')") ||
        !content.includes("require('../../lib/services/LoggingService')")) {
        throw new Error('EventBus or LoggingService not imported');
    }
});

test('APIServer', 'Has _doInitialize method', () => {
    const apiServerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'api', 'apiServer.js');
    const content = fs.readFileSync(apiServerPath, 'utf8');
    if (!content.includes('async _doInitialize()')) {
        throw new Error('_doInitialize method not found');
    }
});

test('APIServer', 'Has _doShutdown method', () => {
    const apiServerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'api', 'apiServer.js');
    const content = fs.readFileSync(apiServerPath, 'utf8');
    if (!content.includes('async _doShutdown()')) {
        throw new Error('_doShutdown method not found');
    }
});

test('APIServer', 'Emits api:started event', () => {
    const apiServerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'api', 'apiServer.js');
    const content = fs.readFileSync(apiServerPath, 'utf8');
    if (!content.includes("this.eventBus.emit('api:started'")) {
        throw new Error('api:started event not emitted');
    }
});

test('APIServer', 'Uses logger in lifecycle methods', () => {
    const apiServerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'api', 'apiServer.js');
    const content = fs.readFileSync(apiServerPath, 'utf8');
    if (!content.includes("this.logger.info('Starting API server'")) {
        throw new Error('Logger not used in lifecycle methods');
    }
});

console.log('\n3. SerialManager Integration');
console.log('=============================\n');

test('SerialManager', 'Extends LifecycleManager', () => {
    const serialManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'serial', 'serialManager.js');
    const content = fs.readFileSync(serialManagerPath, 'utf8');
    if (!content.includes('class SerialManager extends LifecycleManager')) {
        throw new Error('SerialManager does not extend LifecycleManager');
    }
});

test('SerialManager', 'Initializes EventBus and Logger', () => {
    const serialManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'serial', 'serialManager.js');
    const content = fs.readFileSync(serialManagerPath, 'utf8');
    if (!content.includes('this.eventBus = getEventBus()') ||
        !content.includes('this.logger = getLogger()')) {
        throw new Error('EventBus or Logger not initialized');
    }
});

test('SerialManager', 'Emits serial:ready event', () => {
    const serialManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'serial', 'serialManager.js');
    const content = fs.readFileSync(serialManagerPath, 'utf8');
    if (!content.includes("this.eventBus.emit('serial:ready'")) {
        throw new Error('serial:ready event not emitted');
    }
});

test('SerialManager', 'Has _doInitialize and _doShutdown methods', () => {
    const serialManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'serial', 'serialManager.js');
    const content = fs.readFileSync(serialManagerPath, 'utf8');
    if (!content.includes('async _doInitialize()') || !content.includes('async _doShutdown()')) {
        throw new Error('Lifecycle methods not found');
    }
});

console.log('\n4. WebSocketManager Integration');
console.log('================================\n');

test('WebSocketManager', 'Extends LifecycleManager', () => {
    const wsManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'websocket', 'websocketManager.js');
    const content = fs.readFileSync(wsManagerPath, 'utf8');
    if (!content.includes('class WebsocketManager extends LifecycleManager')) {
        throw new Error('WebSocketManager does not extend LifecycleManager');
    }
});

test('WebSocketManager', 'Initializes EventBus and Logger', () => {
    const wsManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'websocket', 'websocketManager.js');
    const content = fs.readFileSync(wsManagerPath, 'utf8');
    if (!content.includes('this.eventBus = getEventBus()') ||
        !content.includes('this.logger = getLogger()')) {
        throw new Error('EventBus or Logger not initialized');
    }
});

test('WebSocketManager', 'Emits websocket:ready event', () => {
    const wsManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'websocket', 'websocketManager.js');
    const content = fs.readFileSync(wsManagerPath, 'utf8');
    if (!content.includes("this.eventBus.emit('websocket:ready'")) {
        throw new Error('websocket:ready event not emitted');
    }
});

test('WebSocketManager', 'Has _doInitialize and _doShutdown methods', () => {
    const wsManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'websocket', 'websocketManager.js');
    const content = fs.readFileSync(wsManagerPath, 'utf8');
    if (!content.includes('async _doInitialize()') || !content.includes('async _doShutdown()')) {
        throw new Error('Lifecycle methods not found');
    }
});

console.log('\n5. WindowManager Integration');
console.log('=============================\n');

test('WindowManager', 'Extends LifecycleManager', () => {
    const windowManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'window', 'windowManager.js');
    const content = fs.readFileSync(windowManagerPath, 'utf8');
    if (!content.includes('class WindowManager extends LifecycleManager')) {
        throw new Error('WindowManager does not extend LifecycleManager');
    }
});

test('WindowManager', 'Accepts config parameter', () => {
    const windowManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'window', 'windowManager.js');
    const content = fs.readFileSync(windowManagerPath, 'utf8');
    if (!content.includes('constructor(config = {})')) {
        throw new Error('Config parameter not accepted');
    }
});

test('WindowManager', 'Initializes EventBus and Logger', () => {
    const windowManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'window', 'windowManager.js');
    const content = fs.readFileSync(windowManagerPath, 'utf8');
    if (!content.includes('this.eventBus = getEventBus()') ||
        !content.includes('this.logger = getLogger()')) {
        throw new Error('EventBus or Logger not initialized');
    }
});

test('WindowManager', 'Uses logger instead of console.log', () => {
    const windowManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'window', 'windowManager.js');
    const content = fs.readFileSync(windowManagerPath, 'utf8');
    if (!content.includes("this.logger.info('Loading React frontend from build')")) {
        throw new Error('Logger not used');
    }
});

console.log('\n6. IPCManager Integration');
console.log('==========================\n');

test('IPCManager', 'Imports DatabaseService', () => {
    const ipcManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'ipc', 'ipcManager.js');
    const content = fs.readFileSync(ipcManagerPath, 'utf8');
    if (!content.includes("require('../../lib/services/DatabaseService')")) {
        throw new Error('DatabaseService not imported');
    }
});

test('IPCManager', 'Initializes DatabaseService', () => {
    const ipcManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'ipc', 'ipcManager.js');
    const content = fs.readFileSync(ipcManagerPath, 'utf8');
    if (!content.includes('this.databaseService = new DatabaseService(database)')) {
        throw new Error('DatabaseService not initialized');
    }
});

test('IPCManager', 'Initializes EventBus and Logger', () => {
    const ipcManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'ipc', 'ipcManager.js');
    const content = fs.readFileSync(ipcManagerPath, 'utf8');
    if (!content.includes('this.eventBus = getEventBus()') ||
        !content.includes('this.logger = getLogger()')) {
        throw new Error('EventBus or Logger not initialized');
    }
});

test('IPCManager', 'Uses DatabaseService in post-data handler', () => {
    const ipcManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'ipc', 'ipcManager.js');
    const content = fs.readFileSync(ipcManagerPath, 'utf8');
    if (!content.includes('this.databaseService.insert(table, data')) {
        throw new Error('DatabaseService not used in post-data handler');
    }
});

test('IPCManager', 'Emits ipc:ready event', () => {
    const ipcManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'ipc', 'ipcManager.js');
    const content = fs.readFileSync(ipcManagerPath, 'utf8');
    if (!content.includes("this.eventBus.emit('ipc:ready'")) {
        throw new Error('ipc:ready event not emitted');
    }
});

test('IPCManager', 'Uses logger in handlers', () => {
    const ipcManagerPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'ipc', 'ipcManager.js');
    const content = fs.readFileSync(ipcManagerPath, 'utf8');
    if (!content.includes("this.logger.debug('IPC post-data'")) {
        throw new Error('Logger not used in handlers');
    }
});

// Print results
console.log('\n========================================');
console.log('VERIFICATION RESULTS BY MODULE');
console.log('========================================');

for (const [category, stats] of Object.entries(categories)) {
    const total = stats.passed + stats.failed;
    const percentage = total > 0 ? ((stats.passed / total) * 100).toFixed(0) : 0;
    console.log(`${category}: ${stats.passed}/${total} passed (${percentage}%)`);
}

console.log('\n========================================');
console.log('OVERALL RESULTS');
console.log('========================================');
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📊 Total Tests: ${testsPassed + testsFailed}`);
console.log(`🎯 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log('========================================\n');

if (testsFailed === 0) {
    console.log('🎉 INTEGRATION FIXES COMPLETE! All modules verified successfully!\n');
    console.log('Completed Integration:');
    console.log('====================\n');
    console.log('✅ DatabaseManager - EventBus + LoggingService');
    console.log('✅ APIServer - LifecycleManager + EventBus + LoggingService');
    console.log('✅ SerialManager - LifecycleManager + EventBus + LoggingService');
    console.log('✅ WebSocketManager - LifecycleManager + EventBus + LoggingService');
    console.log('✅ WindowManager - LifecycleManager + EventBus + LoggingService + Config');
    console.log('✅ IPCManager - DatabaseService + EventBus + LoggingService\n');
    console.log('Benefits:');
    console.log('========\n');
    console.log('📦 Standardized Lifecycle - All managers use LifecycleManager base class');
    console.log('🔄 Event-Driven - All modules emit lifecycle events via EventBus');
    console.log('📝 Structured Logging - All modules use LoggingService with context');
    console.log('🛡️  Database Facade - IPC handlers use DatabaseService for validation');
    console.log('⚙️  Configuration - WindowManager now accepts config parameter\n');
    process.exit(0);
} else {
    console.log('❌ Integration verification FAILED.\n');
    console.log('Please review the errors above and fix the failing tests.\n');
    process.exit(1);
}
