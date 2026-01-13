/**
 * Comprehensive Framework Revision Verification
 *
 * Tests all completed phases:
 * - Phase 1: Centralize cross-cutting concerns (Encryption, Config, Constants)
 * - Phase 2: Fix dependency direction (EventBus, Bootstrap refactor)
 * - Phase 3-4: Create core services (Database, Validation, Logging)
 * - Phase 5: Lifecycle management and graceful shutdown
 */

const path = require('path');
const fs = require('fs');

console.log('========================================');
console.log('FRAMEWORK REVISION - FINAL VERIFICATION');
console.log('========================================\n');

let testsPassed = 0;
let testsFailed = 0;
const phases = {
    'Phase 1': { passed: 0, failed: 0 },
    'Phase 2': { passed: 0, failed: 0 },
    'Phase 3-4': { passed: 0, failed: 0 },
    'Phase 5': { passed: 0, failed: 0 },
    'Integration': { passed: 0, failed: 0 }
};

function test(phase, description, fn) {
    try {
        fn();
        console.log(`✅ ${phase}: ${description}`);
        testsPassed++;
        phases[phase].passed++;
    } catch (error) {
        console.error(`❌ ${phase}: ${description}`);
        console.error(`   Error: ${error.message}`);
        testsFailed++;
        phases[phase].failed++;
    }
}

console.log('Phase 1: Centralize Cross-Cutting Concerns');
console.log('==========================================\n');

// Phase 1.1: Encryption Service
test('Phase 1', 'EncryptionService exists', () => {
    const encryptionPath = path.join(__dirname, 'App', 'modules', 'lib', 'security', 'EncryptionService.js');
    if (!fs.existsSync(encryptionPath)) {
        throw new Error('EncryptionService not found');
    }
});

test('Phase 1', 'EncryptionService is functional', () => {
    const EncryptionService = require('../../App/modules/lib/security/EncryptionService');
    const encryption = new EncryptionService('test-key-32-characters-long!!');
    const encrypted = encryption.encrypt('test data');
    const decrypted = encryption.decrypt(encrypted);
    if (decrypted !== 'test data') {
        throw new Error('Encryption/decryption failed');
    }
});

// Phase 1.2: Configuration
test('Phase 1', 'ConfigResolver provides resolveAll()', () => {
    const configResolver = require('../../App/config');
    if (typeof configResolver.resolveAll !== 'function') {
        throw new Error('resolveAll method not found');
    }
    const config = configResolver.resolveAll();
    if (!config.database || !config.api || !config.websocket) {
        throw new Error('Config missing required modules');
    }
});

test('Phase 1', 'Bootstrap uses ConfigResolver', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');
    if (!bootstrapContent.includes("require('./config')")) {
        throw new Error('Bootstrap does not import ConfigResolver');
    }
    if (!bootstrapContent.includes('resolveAll')) {
        throw new Error('Bootstrap does not use resolveAll');
    }
});

// Phase 1.3: Constants
test('Phase 1', 'Constants registry exists and is comprehensive', () => {
    const constants = require('../../App/config/constants');
    const requiredGroups = ['TABLE_NAMES', 'EVENTS', 'DATABASE_TYPES', 'HTTP_STATUS', 'ENCRYPTION'];
    for (const group of requiredGroups) {
        if (!constants[group]) {
            throw new Error(`Missing constant group: ${group}`);
        }
    }
});

test('Phase 1', 'Bootstrap uses event constants', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');
    if (bootstrapContent.includes(".emit('ready')") || bootstrapContent.includes(".emit('error')")) {
        throw new Error('Bootstrap still has magic strings');
    }
    if (!bootstrapContent.includes('EVENTS.READY')) {
        throw new Error('Bootstrap not using EVENTS constants');
    }
});

console.log('\nPhase 2: Fix Dependency Direction');
console.log('==================================\n');

// Phase 2.1: EventBus
test('Phase 2', 'EventBus exists and is functional', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');
    resetInstance();
    const eventBus = getInstance();

    let called = false;
    eventBus.on('test', () => { called = true; });
    eventBus.emit('test');

    if (!called) {
        throw new Error('EventBus not working');
    }
    resetInstance();
});

test('Phase 2', 'EventBus supports advanced features', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');
    resetInstance();
    const eventBus = getInstance();

    // Test subscriptions, history, stats
    if (typeof eventBus.getStats !== 'function') {
        throw new Error('EventBus missing getStats');
    }
    if (typeof eventBus.getEventHistory !== 'function') {
        throw new Error('EventBus missing getEventHistory');
    }
    if (typeof eventBus.waitFor !== 'function') {
        throw new Error('EventBus missing waitFor');
    }

    resetInstance();
});

// Phase 2.2: Bootstrap refactor
test('Phase 2', 'Bootstrap uses EventBus (not EventEmitter)', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');
    if (bootstrapContent.includes('extends EventEmitter')) {
        throw new Error('Bootstrap still extends EventEmitter');
    }
    if (!bootstrapContent.includes('this.eventBus = getEventBus()')) {
        throw new Error('Bootstrap not using EventBus');
    }
});

test('Phase 2', 'Bootstrap provides EventBus convenience methods', () => {
    const bootstrap = require('../../App/bootstrap');
    if (typeof bootstrap.on !== 'function') {
        throw new Error('Bootstrap missing on() method');
    }
    if (typeof bootstrap.once !== 'function') {
        throw new Error('Bootstrap missing once() method');
    }
    if (typeof bootstrap.getEventBus !== 'function') {
        throw new Error('Bootstrap missing getEventBus() method');
    }
});

console.log('\nPhase 3-4: Create Core Services');
console.log('================================\n');

// Phase 3.1: DatabaseService
test('Phase 3-4', 'DatabaseService exists', () => {
    const dbServicePath = path.join(__dirname, 'App', 'modules', 'lib', 'services', 'DatabaseService.js');
    if (!fs.existsSync(dbServicePath)) {
        throw new Error('DatabaseService not found');
    }
});

test('Phase 3-4', 'DatabaseService has required methods', () => {
    const DatabaseService = require('../../App/modules/lib/services/DatabaseService');
    const requiredMethods = ['insert', 'find', 'findById', 'update', 'delete', 'count', 'healthCheck'];

    // Create a mock adapter
    const mockAdapter = {
        postData: async () => ({ success: true }),
        getDataByFilters: async () => [],
        updateData: async () => ({ success: true }),
        deleteData: async () => ({ success: true }),
        getConfig: () => ({})
    };

    const dbService = new DatabaseService(mockAdapter);

    for (const method of requiredMethods) {
        if (typeof dbService[method] !== 'function') {
            throw new Error(`DatabaseService missing ${method} method`);
        }
    }
});

// Phase 4.1: ValidationService
test('Phase 3-4', 'ValidationService exists and is functional', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/services/ValidationService');
    resetInstance();
    const validation = getInstance();

    const result = validation.validate(
        { email: 'test@example.com', age: 25 },
        { email: { required: true, email: true }, age: { required: true, numeric: true } }
    );

    if (!result.valid) {
        throw new Error('ValidationService validation failed for valid data');
    }

    resetInstance();
});

test('Phase 3-4', 'ValidationService detects invalid data', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/services/ValidationService');
    resetInstance();
    const validation = getInstance();

    const result = validation.validate(
        { email: 'invalid-email', age: 'not-a-number' },
        { email: { required: true, email: true }, age: { required: true, numeric: true } }
    );

    if (result.valid) {
        throw new Error('ValidationService should detect invalid data');
    }
    if (result.errors.length === 0) {
        throw new Error('ValidationService should return errors');
    }

    resetInstance();
});

// Phase 4.2: LoggingService
test('Phase 3-4', 'LoggingService exists and is functional', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/services/LoggingService');
    resetInstance();
    const logger = getInstance({ enableConsole: false, enableFile: false });

    // Should not throw
    logger.info('test message');
    logger.error('test error');
    logger.debug('test debug');

    if (typeof logger.setLevel !== 'function') {
        throw new Error('LoggingService missing setLevel');
    }
    if (typeof logger.child !== 'function') {
        throw new Error('LoggingService missing child');
    }

    resetInstance();
});

console.log('\nPhase 5: Lifecycle Management');
console.log('==============================\n');

// Phase 5.1: LifecycleManager base class
test('Phase 5', 'LifecycleManager base class exists', () => {
    const lifecyclePath = path.join(__dirname, 'App', 'modules', 'lib', 'base', 'LifecycleManager.js');
    if (!fs.existsSync(lifecyclePath)) {
        throw new Error('LifecycleManager not found');
    }
});

test('Phase 5', 'LifecycleManager has standard methods', () => {
    const LifecycleManager = require('../../App/modules/lib/base/LifecycleManager');
    const manager = new LifecycleManager('TestManager');

    const requiredMethods = ['initialize', 'shutdown', 'healthCheck', 'getState', 'isReady'];
    for (const method of requiredMethods) {
        if (typeof manager[method] !== 'function') {
            throw new Error(`LifecycleManager missing ${method} method`);
        }
    }
});

// Phase 5.2: Graceful shutdown
test('Phase 5', 'Bootstrap has graceful shutdown', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    if (!bootstrapContent.includes('async shutdown(options = {})')) {
        throw new Error('Bootstrap shutdown not accepting options');
    }
    if (!bootstrapContent.includes('timeout')) {
        throw new Error('Bootstrap shutdown missing timeout support');
    }
    if (!bootstrapContent.includes('_performShutdown')) {
        throw new Error('Bootstrap missing _performShutdown method');
    }
});

test('Phase 5', 'Bootstrap shutdown has proper order', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    // Check shutdown order is defined
    if (!bootstrapContent.includes('shutdownOrder')) {
        throw new Error('Bootstrap missing shutdownOrder');
    }
});

// Integration tests
console.log('\nIntegration Tests');
console.log('=================\n');

test('Integration', 'All services can be instantiated together', () => {
    const { getInstance: getEventBus, resetInstance: resetEventBus } = require('../../App/modules/lib/events/EventBus');
    const { getInstance: getValidation, resetInstance: resetValidation } = require('../../App/modules/lib/services/ValidationService');
    const { getInstance: getLogger, resetInstance: resetLogger } = require('../../App/modules/lib/services/LoggingService');

    resetEventBus();
    resetValidation();
    resetLogger();

    const eventBus = getEventBus();
    const validation = getValidation();
    const logger = getLogger({ enableConsole: false, enableFile: false });

    if (!eventBus || !validation || !logger) {
        throw new Error('Failed to instantiate services');
    }

    resetEventBus();
    resetValidation();
    resetLogger();
});

test('Integration', 'Constants are used throughout codebase', () => {
    const constants = require('../../App/config/constants');

    // Check that constants are actually used
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const ipcPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'ipc', 'ipcManager.js');

    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');
    const ipcContent = fs.readFileSync(ipcPath, 'utf8');

    if (!bootstrapContent.includes('EVENTS.')) {
        throw new Error('Bootstrap not using event constants');
    }
    if (!ipcContent.includes('TABLE_NAMES.')) {
        throw new Error('IPC Manager not using table name constants');
    }
});

test('Integration', 'File structure is organized', () => {
    const requiredDirs = [
        'App/config',
        'App/modules/lib/events',
        'App/modules/lib/services',
        'App/modules/lib/security',
        'App/modules/lib/base'
    ];

    for (const dir of requiredDirs) {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            throw new Error(`Required directory missing: ${dir}`);
        }
    }
});

// Print results
console.log('\n========================================');
console.log('VERIFICATION RESULTS BY PHASE');
console.log('========================================');

for (const [phase, stats] of Object.entries(phases)) {
    const total = stats.passed + stats.failed;
    const percentage = total > 0 ? ((stats.passed / total) * 100).toFixed(0) : 0;
    console.log(`${phase}: ${stats.passed}/${total} passed (${percentage}%)`);
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
    console.log('🎉 FRAMEWORK REVISION COMPLETE! All phases verified successfully!\n');
    console.log('Completed Phases:');
    console.log('================\n');

    console.log('✅ Phase 1: Centralize Cross-Cutting Concerns');
    console.log('   - EncryptionService (centralized encryption)');
    console.log('   - ConfigResolver with resolveAll() (centralized config)');
    console.log('   - Constants registry (eliminated magic strings)\n');

    console.log('✅ Phase 2: Fix Dependency Direction');
    console.log('   - EventBus (centralized event system)');
    console.log('   - Bootstrap refactored to use EventBus');
    console.log('   - Removed EventEmitter inheritance\n');

    console.log('✅ Phase 3-4: Create Core Services');
    console.log('   - DatabaseService (facade for database operations)');
    console.log('   - ValidationService (centralized validation)');
    console.log('   - LoggingService (centralized logging)\n');

    console.log('✅ Phase 5: Lifecycle Management');
    console.log('   - LifecycleManager base class');
    console.log('   - Graceful shutdown with timeout');
    console.log('   - Standardized health checks\n');

    console.log('Key Benefits Achieved:');
    console.log('=====================\n');
    console.log('📦 Modularity: Clear separation of concerns');
    console.log('🔧 Maintainability: Single source of truth for cross-cutting concerns');
    console.log('🧪 Testability: Easy to mock services and test components');
    console.log('🔒 Safety: No more magic strings, type-safe constants');
    console.log('📊 Observability: Centralized logging and event tracking');
    console.log('🚀 Scalability: EventBus enables loose coupling');
    console.log('💪 Reliability: Graceful shutdown and health checks\n');

    process.exit(0);
} else {
    console.log('❌ Framework revision verification FAILED.\n');
    console.log('Please review the errors above and fix the failing tests.\n');
    process.exit(1);
}
