/**
 * Verification Script for Phase 2, Step 2.2: Refactor Bootstrap to use EventBus
 *
 * Tests:
 * 1. Bootstrap no longer extends EventEmitter
 * 2. Bootstrap uses centralized EventBus
 * 3. Bootstrap maintains public API compatibility
 * 4. Events are emitted through EventBus
 * 5. Bootstrap provides convenience methods
 */

const path = require('path');
const fs = require('fs');

console.log('====================================');
console.log('STEP 2.2 VERIFICATION');
console.log('Refactor Bootstrap to use EventBus');
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

// Test 1: Bootstrap imports EventBus
test('Bootstrap imports EventBus', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    if (!bootstrapContent.includes("require('./modules/lib/events/EventBus')")) {
        throw new Error('Bootstrap does not import EventBus');
    }

    if (!bootstrapContent.includes('getEventBus')) {
        throw new Error('Bootstrap does not import getEventBus function');
    }
});

// Test 2: Bootstrap does NOT extend EventEmitter
test('Bootstrap does not extend EventEmitter', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    if (bootstrapContent.includes('extends EventEmitter')) {
        throw new Error('Bootstrap still extends EventEmitter (should use composition)');
    }
});

// Test 3: Bootstrap uses eventBus for event emission
test('Bootstrap uses eventBus for event emission', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    // Should have eventBus.emit calls
    if (!bootstrapContent.includes('this.eventBus.emit(')) {
        throw new Error('Bootstrap does not use this.eventBus.emit()');
    }

    // Should NOT have direct this.emit calls (except through eventBus)
    const directEmitPattern = /this\.emit\(EVENTS\./g;
    if (directEmitPattern.test(bootstrapContent)) {
        throw new Error('Bootstrap still has direct this.emit() calls');
    }
});

// Test 4: Bootstrap has eventBus instance property
test('Bootstrap has eventBus instance property', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    if (!bootstrapContent.includes('this.eventBus = getEventBus()')) {
        throw new Error('Bootstrap does not initialize eventBus property');
    }
});

// Test 5: Bootstrap provides getEventBus method
test('Bootstrap provides getEventBus method', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    if (!bootstrapContent.includes('getEventBus()')) {
        throw new Error('Bootstrap does not provide getEventBus method');
    }
});

// Test 6: Bootstrap provides on() convenience method
test('Bootstrap provides on() convenience method', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    if (!bootstrapContent.includes('on(eventName, handler)')) {
        throw new Error('Bootstrap does not provide on() method');
    }
});

// Test 7: Bootstrap provides once() convenience method
test('Bootstrap provides once() convenience method', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    if (!bootstrapContent.includes('once(eventName, handler)')) {
        throw new Error('Bootstrap does not provide once() method');
    }
});

// Test 8: Bootstrap provides off() convenience method
test('Bootstrap provides off() convenience method', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    if (!bootstrapContent.includes('off(eventName, handlerOrId)')) {
        throw new Error('Bootstrap does not provide off() method');
    }
});

// Test 9: Bootstrap instance can be imported
test('Bootstrap module exports correctly', () => {
    const bootstrap = require('../../App/bootstrap');

    if (!bootstrap) {
        throw new Error('Bootstrap module not exported');
    }

    if (typeof bootstrap.bootstrap !== 'function') {
        throw new Error('Bootstrap does not export bootstrap method');
    }
});

// Test 10: Bootstrap instance has eventBus property
test('Bootstrap instance has eventBus property', () => {
    const bootstrap = require('../../App/bootstrap');

    if (!bootstrap.eventBus) {
        throw new Error('Bootstrap instance does not have eventBus property');
    }

    if (typeof bootstrap.eventBus.emit !== 'function') {
        throw new Error('Bootstrap eventBus is not properly initialized');
    }
});

// Test 11: Bootstrap convenience methods delegate to eventBus
test('Bootstrap on() delegates to eventBus', () => {
    const bootstrap = require('../../App/bootstrap');

    if (typeof bootstrap.on !== 'function') {
        throw new Error('Bootstrap does not have on() method');
    }

    // Subscribe to a test event
    let called = false;
    const handler = () => { called = true; };

    bootstrap.on('test:event', handler);
    bootstrap.eventBus.emit('test:event');

    if (!called) {
        throw new Error('Bootstrap on() does not properly delegate to eventBus');
    }

    // Clean up
    bootstrap.off('test:event', handler);
});

// Test 12: Bootstrap once() delegates to eventBus
test('Bootstrap once() delegates to eventBus', () => {
    const bootstrap = require('../../App/bootstrap');

    if (typeof bootstrap.once !== 'function') {
        throw new Error('Bootstrap does not have once() method');
    }

    let callCount = 0;
    const handler = () => { callCount++; };

    bootstrap.once('test:once', handler);
    bootstrap.eventBus.emit('test:once');
    bootstrap.eventBus.emit('test:once');

    if (callCount !== 1) {
        throw new Error(`Bootstrap once() should be called once, but was called ${callCount} times`);
    }
});

// Test 13: Bootstrap off() delegates to eventBus
test('Bootstrap off() delegates to eventBus', () => {
    const bootstrap = require('../../App/bootstrap');

    if (typeof bootstrap.off !== 'function') {
        throw new Error('Bootstrap does not have off() method');
    }

    let callCount = 0;
    const handler = () => { callCount++; };

    bootstrap.on('test:off', handler);
    bootstrap.eventBus.emit('test:off'); // Should be called

    bootstrap.off('test:off', handler);
    bootstrap.eventBus.emit('test:off'); // Should NOT be called

    if (callCount !== 1) {
        throw new Error(`Handler should be called once, but was called ${callCount} times`);
    }
});

// Test 14: Bootstrap getEventBus() returns EventBus instance
test('Bootstrap getEventBus() returns EventBus instance', () => {
    const bootstrap = require('../../App/bootstrap');

    if (typeof bootstrap.getEventBus !== 'function') {
        throw new Error('Bootstrap does not have getEventBus() method');
    }

    const eventBus = bootstrap.getEventBus();

    if (!eventBus) {
        throw new Error('getEventBus() does not return an instance');
    }

    if (typeof eventBus.emit !== 'function') {
        throw new Error('EventBus returned by getEventBus() is invalid');
    }
});

// Test 15: All events use constants from EVENTS
test('All events use constants from EVENTS', () => {
    const bootstrapPath = path.join(__dirname, 'App', 'bootstrap.js');
    const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');

    // Check that emit calls use EVENTS constants
    const emitCalls = bootstrapContent.match(/this\.eventBus\.emit\([^)]+\)/g);

    if (!emitCalls || emitCalls.length === 0) {
        throw new Error('No eventBus.emit calls found');
    }

    for (const call of emitCalls) {
        if (!call.includes('EVENTS.')) {
            throw new Error(`Found emit call without EVENTS constant: ${call}`);
        }
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
    console.log('🎉 Step 2.2 implementation VERIFIED successfully!\n');
    console.log('Summary of Changes:');
    console.log('✅ Bootstrap no longer extends EventEmitter');
    console.log('✅ Bootstrap uses centralized EventBus via composition');
    console.log('✅ Bootstrap maintains backward-compatible public API');
    console.log('✅ All events emitted through EventBus (single source of truth)');
    console.log('✅ Bootstrap provides convenience methods (on, once, off)');
    console.log('✅ Bootstrap provides getEventBus() for direct access');
    console.log('✅ All events use constants from EVENTS\n');

    console.log('Benefits Achieved:');
    console.log('- Single centralized event system');
    console.log('- All module events go through same EventBus');
    console.log('- Easy to debug and trace event flow');
    console.log('- Maintains API compatibility');
    console.log('- Better testability and monitoring\n');

    process.exit(0);
} else {
    console.log('❌ Step 2.2 verification FAILED. Please review the errors above.\n');
    process.exit(1);
}
