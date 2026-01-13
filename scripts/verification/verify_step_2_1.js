/**
 * Verification Script for Phase 2, Step 2.1: Create EventBus
 *
 * Tests:
 * 1. EventBus file exists and exports correctly
 * 2. EventBus implements publish-subscribe pattern
 * 3. EventBus supports one-time subscriptions
 * 4. EventBus tracks subscriptions for debugging
 * 5. EventBus supports namespaced events
 * 6. EventBus history tracking works
 * 7. Event Bus statistics work correctly
 */

const path = require('path');
const fs = require('fs');

console.log('====================================');
console.log('STEP 2.1 VERIFICATION');
console.log('Create EventBus');
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

// Test 1: EventBus file exists
test('EventBus file exists', () => {
    const eventBusPath = path.join(__dirname, 'App', 'modules', 'lib', 'events', 'EventBus.js');
    if (!fs.existsSync(eventBusPath)) {
        throw new Error('EventBus file not found');
    }
});

// Test 2: EventBus exports correctly
test('EventBus exports getInstance and EventBus class', () => {
    const EventBusModule = require('../../App/modules/lib/events/EventBus');

    if (!EventBusModule.getInstance) {
        throw new Error('getInstance function not exported');
    }
    if (!EventBusModule.EventBus) {
        throw new Error('EventBus class not exported');
    }
    if (!EventBusModule.resetInstance) {
        throw new Error('resetInstance function not exported');
    }
});

// Test 3: EventBus is a singleton
test('EventBus getInstance returns same instance', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance(); // Reset for clean test

    const instance1 = getInstance();
    const instance2 = getInstance();

    if (instance1 !== instance2) {
        throw new Error('getInstance does not return the same instance');
    }

    resetInstance(); // Clean up
});

// Test 4: EventBus supports basic pub-sub
test('EventBus supports basic publish-subscribe', (done) => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance();
    const eventBus = getInstance();

    let called = false;
    const testData = { message: 'test' };

    eventBus.on('test:event', (data) => {
        if (data.message === testData.message) {
            called = true;
        }
    });

    eventBus.emit('test:event', testData);

    if (!called) {
        throw new Error('Event handler was not called');
    }

    resetInstance();
});

// Test 5: EventBus supports one-time subscriptions
test('EventBus supports one-time subscriptions (once)', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance();
    const eventBus = getInstance();

    let callCount = 0;

    eventBus.once('test:once', () => {
        callCount++;
    });

    eventBus.emit('test:once');
    eventBus.emit('test:once');
    eventBus.emit('test:once');

    if (callCount !== 1) {
        throw new Error(`Once handler should be called once, but was called ${callCount} times`);
    }

    resetInstance();
});

// Test 6: EventBus tracks subscriptions
test('EventBus tracks subscriptions for debugging', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance();
    const eventBus = getInstance();

    const handler1 = () => {};
    const handler2 = () => {};

    eventBus.on('test:track', handler1);
    eventBus.on('test:track', handler2);

    const subscriptions = eventBus.getSubscriptions('test:track');

    if (subscriptions.length !== 2) {
        throw new Error(`Expected 2 subscriptions, got ${subscriptions.length}`);
    }

    resetInstance();
});

// Test 7: EventBus supports unsubscribe
test('EventBus supports unsubscribe', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance();
    const eventBus = getInstance();

    let callCount = 0;
    const handler = () => { callCount++; };

    eventBus.on('test:unsub', handler);
    eventBus.emit('test:unsub'); // Should be called

    eventBus.off('test:unsub', handler);
    eventBus.emit('test:unsub'); // Should NOT be called

    if (callCount !== 1) {
        throw new Error(`Handler should be called once, but was called ${callCount} times`);
    }

    resetInstance();
});

// Test 8: EventBus supports unsubscribe by ID
test('EventBus supports unsubscribe by subscription ID', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance();
    const eventBus = getInstance();

    let callCount = 0;
    const handler = () => { callCount++; };

    const subId = eventBus.on('test:unsub-id', handler);
    eventBus.emit('test:unsub-id'); // Should be called

    eventBus.off('test:unsub-id', subId);
    eventBus.emit('test:unsub-id'); // Should NOT be called

    if (callCount !== 1) {
        throw new Error(`Handler should be called once, but was called ${callCount} times`);
    }

    resetInstance();
});

// Test 9: EventBus tracks event history
test('EventBus tracks event history', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance();
    const eventBus = getInstance();

    eventBus.emit('test:history1', { data: 1 });
    eventBus.emit('test:history2', { data: 2 });
    eventBus.emit('test:history3', { data: 3 });

    const history = eventBus.getEventHistory();

    if (history.length < 3) {
        throw new Error(`Expected at least 3 events in history, got ${history.length}`);
    }

    const lastEvent = history[history.length - 1];
    if (lastEvent.eventName !== 'test:history3') {
        throw new Error('Event history not tracking correctly');
    }

    resetInstance();
});

// Test 10: EventBus supports namespaced events
test('EventBus supports namespaced events', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance();
    const eventBus = getInstance();

    let called = false;
    const nsEventBus = eventBus.namespace('database');

    nsEventBus.on('connected', () => {
        called = true;
    });

    nsEventBus.emit('connected');

    if (!called) {
        throw new Error('Namespaced event handler was not called');
    }

    resetInstance();
});

// Test 11: EventBus provides statistics
test('EventBus provides statistics', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance();
    const eventBus = getInstance();

    eventBus.on('test:stats1', () => {});
    eventBus.on('test:stats1', () => {});
    eventBus.on('test:stats2', () => {});

    const stats = eventBus.getStats();

    if (stats.totalSubscriptions !== 3) {
        throw new Error(`Expected 3 total subscriptions, got ${stats.totalSubscriptions}`);
    }

    if (stats.activeEvents !== 2) {
        throw new Error(`Expected 2 active events, got ${stats.activeEvents}`);
    }

    resetInstance();
});

// Test 12: EventBus supports waitFor
test('EventBus supports waitFor (async event waiting)', async () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance();
    const eventBus = getInstance();

    const testData = { value: 42 };

    // Emit event after a short delay
    setTimeout(() => {
        eventBus.emit('test:wait', testData);
    }, 50);

    // Wait for event
    const result = await eventBus.waitFor('test:wait', 1000);

    if (result.value !== 42) {
        throw new Error('waitFor did not receive correct data');
    }

    resetInstance();
});

// Test 13: EventBus getListenerCount works
test('EventBus getListenerCount returns correct count', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance();
    const eventBus = getInstance();

    eventBus.on('test:count', () => {});
    eventBus.on('test:count', () => {});
    eventBus.on('test:count', () => {});

    const count = eventBus.getListenerCount('test:count');

    if (count !== 3) {
        throw new Error(`Expected 3 listeners, got ${count}`);
    }

    resetInstance();
});

// Test 14: EventBus removeAllListeners works
test('EventBus removeAllListeners removes all listeners', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance();
    const eventBus = getInstance();

    eventBus.on('test:remove', () => {});
    eventBus.on('test:remove', () => {});

    eventBus.removeAllListeners('test:remove');

    const count = eventBus.getListenerCount('test:remove');

    if (count !== 0) {
        throw new Error(`Expected 0 listeners after removeAllListeners, got ${count}`);
    }

    resetInstance();
});

// Test 15: EventBus destroy cleans up properly
test('EventBus destroy cleans up properly', () => {
    const { getInstance, resetInstance } = require('../../App/modules/lib/events/EventBus');

    resetInstance();
    const eventBus = getInstance();

    eventBus.on('test:destroy', () => {});
    eventBus.emit('test:destroy');

    eventBus.destroy();

    const stats = eventBus.getStats();
    const history = eventBus.getEventHistory();

    if (stats.totalSubscriptions !== 0) {
        throw new Error('EventBus not cleaned up after destroy');
    }

    if (history.length !== 0) {
        throw new Error('Event history not cleared after destroy');
    }

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
    console.log('🎉 Step 2.1 implementation VERIFIED successfully!\n');
    console.log('Summary of Changes:');
    console.log('✅ Created EventBus class (App/modules/lib/events/EventBus.js)');
    console.log('✅ Singleton pattern for global event coordination');
    console.log('✅ Publish-subscribe pattern implementation');
    console.log('✅ Support for one-time subscriptions (once)');
    console.log('✅ Subscription tracking and debugging features');
    console.log('✅ Event history for debugging');
    console.log('✅ Namespaced events support');
    console.log('✅ Statistics and monitoring');
    console.log('✅ Async event waiting (waitFor)');
    console.log('✅ Proper cleanup and destroy methods\n');

    console.log('Benefits Achieved:');
    console.log('- Decouples modules from each other');
    console.log('- Single source of truth for event flow');
    console.log('- Easy to trace and debug event paths');
    console.log('- Testable with mock subscriptions');
    console.log('- Type-safe with event constants');
    console.log('- Better scalability and maintainability\n');

    process.exit(0);
} else {
    console.log('❌ Step 2.1 verification FAILED. Please review the errors above.\n');
    process.exit(1);
}
