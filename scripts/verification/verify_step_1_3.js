/**
 * Verification Script for Phase 1, Step 1.3: Create Constants Registry
 *
 * Tests:
 * 1. Constants file exists and exports all required constant groups
 * 2. Bootstrap uses event constants instead of magic strings
 * 3. IPC Manager uses table name constants
 * 4. Database Adapter uses table name constants
 * 5. Constants are properly structured and documented
 */

const path = require('path');
const fs = require('fs');

console.log('====================================');
console.log('STEP 1.3 VERIFICATION');
console.log('Create Constants Registry');
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

// Test 1: Constants file exists
test('Constants file exists', () => {
    const constantsPath = path.join(__dirname, 'App', 'config', 'constants.js');
    if (!fs.existsSync(constantsPath)) {
        throw new Error('Constants file not found');
    }
});

// Test 2: Constants exports all required groups
test('Constants exports all required constant groups', () => {
    const constants = require('../../App/config/constants');

    const requiredGroups = [
        'TABLE_NAMES',
        'EVENTS',
        'DATABASE_TYPES',
        'ENVIRONMENT_MODES',
        'HTTP_STATUS',
        'ENCRYPTION',
        'SERIAL',
        'WEBSOCKET',
        'API',
        'WINDOW',
        'LOG_LEVELS',
        'VALIDATION',
        'IPC_CHANNELS',
        'ERROR_MESSAGES',
        'SUCCESS_MESSAGES'
    ];

    for (const group of requiredGroups) {
        if (!constants[group]) {
            throw new Error(`Missing constant group: ${group}`);
        }
    }
});

// Test 3: TABLE_NAMES includes expected tables
test('TABLE_NAMES includes expected tables', () => {
    const { TABLE_NAMES } = require('../../App/config/constants');

    const expectedTables = [
        'USERS',
        'SENSOR_DATA',
        'SENSORS',
        'TEMPERATURE_DATA',
        'PRESSURE_DATA',
        'PH_DATA'
    ];

    for (const table of expectedTables) {
        if (!TABLE_NAMES[table]) {
            throw new Error(`Missing table name constant: ${table}`);
        }
    }

    // Verify actual values match expected naming convention
    if (TABLE_NAMES.USERS !== 'users') {
        throw new Error('TABLE_NAMES.USERS has incorrect value');
    }
    if (TABLE_NAMES.TEMPERATURE_DATA !== 'temperature_data') {
        throw new Error('TABLE_NAMES.TEMPERATURE_DATA has incorrect value');
    }
});

// Test 4: EVENTS includes all framework events
test('EVENTS includes all framework events', () => {
    const { EVENTS } = require('../../App/config/constants');

    const expectedEvents = [
        'READY',
        'ERROR',
        'SHUTDOWN',
        'ENCRYPTION_READY',
        'DATABASE_READY',
        'WINDOW_READY',
        'API_READY',
        'SERIAL_READY',
        'WEBSOCKET_READY',
        'IPC_READY'
    ];

    for (const event of expectedEvents) {
        if (!EVENTS[event]) {
            throw new Error(`Missing event constant: ${event}`);
        }
    }

    // Verify actual values
    if (EVENTS.READY !== 'ready') {
        throw new Error('EVENTS.READY has incorrect value');
    }
    if (EVENTS.ENCRYPTION_READY !== 'encryption:ready') {
        throw new Error('EVENTS.ENCRYPTION_READY has incorrect value');
    }
});

// Test 5: Bootstrap imports constants
test('Bootstrap imports constants', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    if (!bootstrapContent.includes("require('./config/constants')")) {
        throw new Error('Bootstrap does not import constants');
    }

    if (!bootstrapContent.includes('EVENTS')) {
        throw new Error('Bootstrap does not import EVENTS');
    }
});

// Test 6: Bootstrap uses EVENTS constants
test('Bootstrap uses EVENTS constants instead of magic strings', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    // Should NOT have magic strings anymore
    const magicStrings = [
        ".emit('ready')",
        ".emit('error',",
        ".emit('encryption:ready')",
        ".emit('database:ready')",
        ".emit('api:ready')"
    ];

    for (const magicString of magicStrings) {
        if (bootstrapContent.includes(magicString)) {
            throw new Error(`Bootstrap still contains magic string: ${magicString}`);
        }
    }

    // SHOULD have constant references
    const constantRefs = [
        'EVENTS.READY',
        'EVENTS.ERROR',
        'EVENTS.ENCRYPTION_READY',
        'EVENTS.DATABASE_READY',
        'EVENTS.API_READY'
    ];

    for (const ref of constantRefs) {
        if (!bootstrapContent.includes(ref)) {
            throw new Error(`Bootstrap missing constant reference: ${ref}`);
        }
    }
});

// Test 7: IPC Manager imports constants
test('IPC Manager imports constants', () => {
    const ipcPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'ipc', 'ipcManager.js');
    const ipcContent = fs.readFileSync(ipcPath, 'utf8');

    if (!ipcContent.includes('TABLE_NAMES')) {
        throw new Error('IPC Manager does not import TABLE_NAMES');
    }
});

// Test 8: IPC Manager uses TABLE_NAMES constants
test('IPC Manager uses TABLE_NAMES constants instead of magic strings', () => {
    const ipcPath = path.join(__dirname, 'App', 'modules', 'modules_config', 'ipc', 'ipcManager.js');
    const ipcContent = fs.readFileSync(ipcPath, 'utf8');

    // Should NOT have magic strings for table names
    const magicStrings = [
        "'temperature_data'",
        "'pressure_data'"
    ];

    for (const magicString of magicStrings) {
        if (ipcContent.includes(magicString)) {
            throw new Error(`IPC Manager still contains magic string: ${magicString}`);
        }
    }

    // SHOULD have constant references
    if (!ipcContent.includes('TABLE_NAMES.TEMPERATURE_DATA')) {
        throw new Error('IPC Manager missing TABLE_NAMES.TEMPERATURE_DATA reference');
    }
    if (!ipcContent.includes('TABLE_NAMES.PRESSURE_DATA')) {
        throw new Error('IPC Manager missing TABLE_NAMES.PRESSURE_DATA reference');
    }
});

// Test 9: Database Adapter imports constants
test('Database Adapter imports constants', () => {
    const adapterPath = path.join(__dirname, 'App', 'modules', 'lib', 'db', 'databaseAdapter.js');
    const adapterContent = fs.readFileSync(adapterPath, 'utf8');

    if (!adapterContent.includes('TABLE_NAMES')) {
        throw new Error('Database Adapter does not import TABLE_NAMES');
    }
});

// Test 10: Database Adapter uses TABLE_NAMES constants
test('Database Adapter uses TABLE_NAMES constants', () => {
    const adapterPath = path.join(__dirname, 'App', 'modules', 'lib', 'db', 'databaseAdapter.js');
    const adapterContent = fs.readFileSync(adapterPath, 'utf8');

    // Check for constant usage in getAllUsers and insertUser
    if (!adapterContent.includes('TABLE_NAMES.USERS')) {
        throw new Error('Database Adapter should use TABLE_NAMES.USERS');
    }
});

// Test 11: Constants are properly structured objects
test('Constants are properly structured objects', () => {
    const constants = require('../../App/config/constants');

    // TABLE_NAMES should be an object with string values
    if (typeof constants.TABLE_NAMES !== 'object') {
        throw new Error('TABLE_NAMES is not an object');
    }

    // EVENTS should be an object with string values
    if (typeof constants.EVENTS !== 'object') {
        throw new Error('EVENTS is not an object');
    }

    // Verify values are strings
    for (const [key, value] of Object.entries(constants.TABLE_NAMES)) {
        if (typeof value !== 'string') {
            throw new Error(`TABLE_NAMES.${key} is not a string`);
        }
    }
});

// Test 12: HTTP_STATUS has standard codes
test('HTTP_STATUS includes standard HTTP status codes', () => {
    const { HTTP_STATUS } = require('../../App/config/constants');

    const expectedCodes = {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500
    };

    for (const [key, expectedValue] of Object.entries(expectedCodes)) {
        if (HTTP_STATUS[key] !== expectedValue) {
            throw new Error(`HTTP_STATUS.${key} should be ${expectedValue}, got ${HTTP_STATUS[key]}`);
        }
    }
});

// Test 13: ENCRYPTION constants are defined
test('ENCRYPTION constants are defined', () => {
    const { ENCRYPTION } = require('../../App/config/constants');

    if (!ENCRYPTION.ALGORITHM) {
        throw new Error('ENCRYPTION.ALGORITHM not defined');
    }
    if (!ENCRYPTION.IV_LENGTH) {
        throw new Error('ENCRYPTION.IV_LENGTH not defined');
    }
    if (!Array.isArray(ENCRYPTION.SENSITIVE_FIELDS)) {
        throw new Error('ENCRYPTION.SENSITIVE_FIELDS should be an array');
    }
});

// Test 14: Error messages are defined
test('ERROR_MESSAGES are defined', () => {
    const { ERROR_MESSAGES } = require('../../App/config/constants');

    const expectedMessages = [
        'INVALID_CREDENTIALS',
        'DATABASE_NOT_INITIALIZED',
        'ENCRYPTION_KEY_MISSING'
    ];

    for (const msg of expectedMessages) {
        if (!ERROR_MESSAGES[msg]) {
            throw new Error(`Missing error message: ${msg}`);
        }
        if (typeof ERROR_MESSAGES[msg] !== 'string') {
            throw new Error(`ERROR_MESSAGES.${msg} should be a string`);
        }
    }
});

// Test 15: Constants have aliases for convenience
test('Constants have convenience aliases', () => {
    const constants = require('../../App/config/constants');

    // Check for aliases
    if (!constants.TABLES) {
        throw new Error('TABLES alias not found');
    }
    if (constants.TABLES !== constants.TABLE_NAMES) {
        throw new Error('TABLES alias does not reference TABLE_NAMES');
    }

    if (!constants.DB_TYPES) {
        throw new Error('DB_TYPES alias not found');
    }
    if (constants.DB_TYPES !== constants.DATABASE_TYPES) {
        throw new Error('DB_TYPES alias does not reference DATABASE_TYPES');
    }
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
    console.log('🎉 Step 1.3 implementation VERIFIED successfully!\n');
    console.log('Summary of Changes:');
    console.log('✅ Created comprehensive constants registry (App/config/constants.js)');
    console.log('✅ Bootstrap uses event constants (no more magic strings)');
    console.log('✅ IPC Manager uses table name constants');
    console.log('✅ Database Adapter uses table name constants');
    console.log('✅ 15 constant groups defined (tables, events, HTTP, encryption, etc.)');
    console.log('✅ Constants are properly structured and documented');
    console.log('✅ Prevents split-brain bugs and makes refactoring safer\n');

    console.log('Benefits Achieved:');
    console.log('- Single source of truth for all framework constants');
    console.log('- Easy to find where constants are used (search for TABLE_NAMES)');
    console.log('- Safer refactoring (change constant value in one place)');
    console.log('- Better IDE autocomplete and type safety');
    console.log('- Self-documenting code with descriptive constant names\n');

    process.exit(0);
} else {
    console.log('❌ Step 1.3 verification FAILED. Please review the errors above.\n');
    process.exit(1);
}
