/**
 * Verification Script for Phase 1, Step 1.2: Unify Configuration Access
 *
 * Tests:
 * 1. ConfigResolver.resolveAll() returns structured config
 * 2. Config structure includes all required modules
 * 3. Default values are properly set
 * 4. Bootstrap can load and use the config
 */

const path = require('path');
const fs = require('fs');

// Test configuration
console.log('====================================');
console.log('STEP 1.2 VERIFICATION');
console.log('Unify Configuration Access');
console.log('====================================\n');

let testsPassed = 0;
let testsFailed = 0;

function test(description, fn) {
    try {
        fn();
        console.log(`✅ PASS: ${description}`);
        testsPassed++;
    } catch (error) {
        console.error(`❌ FAIL: ${description}`);
        console.error(`   Error: ${error.message}`);
        testsFailed++;
    }
}

// Test 1: ConfigResolver exists and is properly structured
test('ConfigResolver module exists', () => {
    const configResolverPath = path.join(__dirname, 'App', 'config', 'index.js');
    if (!fs.existsSync(configResolverPath)) {
        throw new Error('ConfigResolver not found');
    }
});

test('ConfigResolver exports expected methods', () => {
    const configResolver = require('../../App/config');

    if (typeof configResolver.resolveAll !== 'function') {
        throw new Error('resolveAll method not found');
    }

    if (typeof configResolver.getConfig !== 'function') {
        throw new Error('getConfig method not found');
    }
});

// Test 2: ConfigResolver.resolveAll() returns proper structure
test('ConfigResolver.resolveAll() returns structured config', () => {
    const configResolver = require('../../App/config');
    const config = configResolver.resolveAll();

    if (!config || typeof config !== 'object') {
        throw new Error('resolveAll did not return an object');
    }

    const requiredModules = ['database', 'api', 'websocket', 'serial', 'window', 'ipc', 'encryption'];
    for (const module of requiredModules) {
        if (!config.hasOwnProperty(module)) {
            throw new Error(`Config missing required module: ${module}`);
        }
    }
});

// Test 3: Database config has all database types
test('Database config includes all database types', () => {
    const configResolver = require('../../App/config');
    const config = configResolver.resolveAll();

    if (!config.database.type) {
        throw new Error('Database type not set');
    }

    if (!config.database.mysql) {
        throw new Error('MySQL config missing');
    }

    if (!config.database.firebase) {
        throw new Error('Firebase config missing');
    }

    if (!config.database.cosmosdb) {
        throw new Error('CosmosDB config missing');
    }
});

// Test 4: API config has required fields
test('API config includes required fields', () => {
    const configResolver = require('../../App/config');
    const config = configResolver.resolveAll();

    if (!config.api.port) {
        throw new Error('API port not set');
    }

    if (!config.api.host) {
        throw new Error('API host not set');
    }
});

// Test 5: Websocket config has required fields
test('Websocket config includes required fields', () => {
    const configResolver = require('../../App/config');
    const config = configResolver.resolveAll();

    if (!config.websocket.port) {
        throw new Error('Websocket port not set');
    }

    if (typeof config.websocket.enableAuth !== 'boolean') {
        throw new Error('Websocket enableAuth not set');
    }
});

// Test 6: Serial config exists
test('Serial config exists', () => {
    const configResolver = require('../../App/config');
    const config = configResolver.resolveAll();

    if (typeof config.serial !== 'object') {
        throw new Error('Serial config not an object');
    }
});

// Test 7: Window config has dimensions
test('Window config includes dimensions', () => {
    const configResolver = require('../../App/config');
    const config = configResolver.resolveAll();

    if (!config.window.width) {
        throw new Error('Window width not set');
    }

    if (!config.window.height) {
        throw new Error('Window height not set');
    }
});

// Test 8: Config overrides work
test('ConfigResolver accepts and applies overrides', () => {
    const configResolver = require('../../App/config');
    const config = configResolver.resolveAll({
        api: { port: 9999 },
        websocket: { port: 8888 }
    });

    if (config.api.port !== 9999) {
        throw new Error('API port override not applied');
    }

    if (config.websocket.port !== 8888) {
        throw new Error('Websocket port override not applied');
    }
});

// Test 9: Bootstrap imports ConfigResolver
test('Bootstrap imports ConfigResolver', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    if (!bootstrapContent.includes("require('./config')")) {
        throw new Error('Bootstrap does not import ConfigResolver');
    }

    if (!bootstrapContent.includes('resolveAll')) {
        throw new Error('Bootstrap does not call resolveAll');
    }
});

// Test 10: DatabaseManager accepts config parameter
test('DatabaseManager constructor accepts config parameter', () => {
    const DatabaseManager = require('../../App/modules/modules_config/database/databaseManager');
    const EncryptionService = require('../../App/modules/lib/security/EncryptionService');

    const encryptionKey = 'test-key-for-verification-only-32-characters';
    const encryption = new EncryptionService(encryptionKey);

    const config = { type: 'mysql', mysql: { host: 'localhost' } };
    const dbManager = new DatabaseManager(encryption, config);

    if (!dbManager.config) {
        throw new Error('DatabaseManager did not store config');
    }

    if (dbManager.dbType !== 'mysql') {
        throw new Error('DatabaseManager did not use config.type');
    }
});

// Test 11: WebsocketManager accepts config parameter
test('WebsocketManager constructor accepts config parameter', () => {
    const WebsocketManager = require('../../App/modules/modules_config/websocket/websocketManager');

    const config = { port: 9090, enableAuth: true };
    const wsManager = new WebsocketManager(null, null, config);

    if (!wsManager.config) {
        throw new Error('WebsocketManager did not store config');
    }

    if (wsManager.config.port !== 9090) {
        throw new Error('WebsocketManager did not use config.port');
    }
});

// Test 12: SerialManager accepts config parameter
test('SerialManager constructor accepts config parameter', () => {
    const SerialManager = require('../../App/modules/modules_config/serial/serialManager');

    const config = { baudRate: 115200 };
    const serialManager = new SerialManager(null, null, config);

    if (!serialManager.config) {
        throw new Error('SerialManager did not store config');
    }
});

// Test 13: APIServer accepts config parameter
test('APIServer constructor accepts config parameter', () => {
    const APIServer = require('../../App/modules/modules_config/api/apiServer');

    const config = { port: 4000 };
    const apiServer = new APIServer(null, config);

    if (!apiServer.config) {
        throw new Error('APIServer did not store config');
    }

    if (apiServer.port !== 4000) {
        throw new Error('APIServer did not use config.port');
    }
});

// Test 14: DatabaseAdapter accepts config parameter
test('DatabaseAdapter getInstance accepts config parameter', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/db/databaseAdapter');
    const EncryptionService = require('../../App/modules/lib/security/EncryptionService');

    // Reset singleton first
    resetInstance();

    const encryptionKey = 'test-key-for-verification-only-32-characters';
    const encryption = new EncryptionService(encryptionKey);
    const config = { type: 'mysql', mysql: { host: 'test' } };

    const adapter = getInstance(encryption, config);

    if (!adapter.config) {
        throw new Error('DatabaseAdapter did not store config');
    }

    if (adapter.config.type !== 'mysql') {
        throw new Error('DatabaseAdapter did not use config.type');
    }

    // Clean up
    resetInstance();
});

// Print results
console.log('\n====================================');
console.log('VERIFICATION RESULTS');
console.log('====================================');
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📊 Total Tests: ${testsPassed + testsFailed}`);
console.log('====================================\n');

if (testsFailed === 0) {
    console.log('🎉 Step 1.2 implementation VERIFIED successfully!\n');
    console.log('Summary of Changes:');
    console.log('✅ ConfigResolver.resolveAll() provides structured config');
    console.log('✅ Bootstrap loads config once and passes to modules');
    console.log('✅ DatabaseManager accepts and uses config');
    console.log('✅ WebsocketManager accepts and uses config');
    console.log('✅ SerialManager accepts and uses config');
    console.log('✅ APIServer accepts and uses config');
    console.log('✅ DatabaseAdapter accepts and uses config');
    console.log('✅ Configuration is centralized and testable\n');

    process.exit(0);
} else {
    console.log('❌ Step 1.2 verification FAILED. Please review the errors above.\n');
    process.exit(1);
}
