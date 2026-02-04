# Framework Architecture Revision & Improvement Plan

## Document Purpose

This document provides a step-by-step plan to revise and improve the internal framework architecture of the AIST application. All changes are focused on fixing existing structural issues, clarifying responsibilities, and improving maintainability **without adding new features or modifying controller logic**.

---

## Overview of Problems

The current framework suffers from:

1. **Inverted dependencies** - Communicators depend on Database instead of emitting events
2. **Duplicated cross-cutting concerns** - Encryption, validation, configuration scattered
3. **Ambiguous authority** - Multiple entry points for same responsibility (database initialization)
4. **Implicit coupling** - Runtime type checking, hardcoded paths, global singletons
5. **Hidden side effects** - Global state dependencies, unmanaged subscriptions
6. **Poor separation of concerns** - Business logic mixed with infrastructure

---

## Key Improvements in v1.1

This revision addresses three critical gaps identified in the original plan:

1. **Step 2.4: Decouple ApiServer from Controllers** (NEW)
   - **Problem:** Framework imports application controllers, making it non-reusable
   - **Solution:** Inject routes via bootstrap, framework only handles HTTP mechanics
   - **Impact:** Framework can now be extracted to separate npm package

2. **Enhanced Step 1.3: Table Name Audit** (ENHANCED)
   - **Problem:** Just creating constants doesn't fix existing bugs (API vs WebSocket table mismatch)
   - **Solution:** Explicit migration checklist to verify all hardcoded strings replaced
   - **Impact:** Prevents "split brain" where different layers use different table names

3. **Enhanced Step 4.1: Validation Hybrid Approach** (ENHANCED)
   - **Problem:** Config-driven validation (current) vs. Joi schemas (proposed) mismatch
   - **Solution:** ValidationService supports both approaches with migration path
   - **Impact:** Preserves flexibility while gaining type safety

4. **Expanded Verification Checklist** (ENHANCED)
   - **Problem:** Generic checklist doesn't catch critical migration issues
   - **Solution:** Phase-specific critical verifications with concrete examples
   - **Impact:** Clear pass/fail criteria for each phase

---

## Phase 1: Establish Single Sources of Truth

### Step 1.1: Centralize Encryption Logic

**What to change:**
- Extract all encryption logic from `App/modules/lib/db/mysqlDB.js`, `App/modules/lib/db/firebaseDB.js`, and `App/modules/lib/db/cosmosDB.js`
- Create `App/modules/lib/security/EncryptionService.js` as the single encryption implementation

**Why it needs to change:**
- Security logic is currently duplicated in 3 files (150+ lines of identical AES-256-CBC code)
- Key rotation or algorithm changes require synchronized updates across unrelated files
- Encryption is a cross-cutting concern that has leaked into database drivers

**What part of framework it affects:**
- Database adapters (mysqlDB, firebaseDB, cosmosDB)
- Any module performing field-level encryption

**What dependencies are impacted:**
- All database adapters must import and use `EncryptionService`
- Remove direct `crypto` module usage from database files

**Implementation:**
```javascript
// App/modules/lib/security/EncryptionService.js
class EncryptionService {
  constructor(encryptionKey) {
    if (!encryptionKey || encryptionKey.length === 0) {
      throw new Error('Encryption key must be provided');
    }
    this.algorithm = 'aes-256-cbc';
    this.secretKey = crypto.createHash('sha256').update(encryptionKey).digest();
    this.ivLength = 16;
  }

  encrypt(text) { /* Single implementation */ }
  decrypt(encryptedData) { /* Single implementation */ }
  encryptFields(object, fieldNames) { /* Helper method */ }
  decryptFields(object, fieldNames) { /* Helper method */ }
}

module.exports = EncryptionService;
```

**Migration steps:**
1. Create `EncryptionService.js` with all encryption logic
2. Update `bootstrap.js` to instantiate EncryptionService once
3. Pass EncryptionService instance to database adapters via constructor
4. Replace all `encryptData()` / `decryptData()` calls in adapters with `this.encryption.encrypt()`
5. Remove duplicate crypto code from all 3 database files
6. Add validation: throw error if `DB_ENCRYPTION_KEY` is empty (fix the `|| ''` fallback)

---

### Step 1.2: Unify Configuration Access

**What to change:**
- Enforce that **all modules** use `App/config/index.js` as the single source of configuration
- Remove direct `process.env` access from `SerialManager`, `WebsocketManager`, and database adapters
- Inject configuration objects during module initialization

**Why it needs to change:**
- Modules currently bypass the centralized config resolver and read `process.env` directly
- No single source of truth for environment management
- Impossible to override config for testing without mutating global `process.env`

**What part of framework it affects:**
- All module managers (`SerialManager`, `WebsocketManager`, `DatabaseManager`)
- Database adapters (direct env reads in constructors)
- Bootstrap initialization flow

**What dependencies are impacted:**
- `bootstrap.js` must load config once and pass to all modules
- Modules must accept config as constructor parameter

**Implementation:**
```javascript
// App/bootstrap.js
async init(modules = []) {
  // Load config ONCE at bootstrap
  const config = ConfigResolver.resolve();

  if (modules.includes('database')) {
    this.databaseManager = new DatabaseManager(config.database);
  }

  if (modules.includes('websocket')) {
    this.websocketManager = new WebsocketManager(config.websocket);
  }

  if (modules.includes('serial')) {
    this.serialManager = new SerialManager(config.serial);
  }
}
```

**Migration steps:**
1. Update `ConfigResolver.resolve()` to return structured config object with sub-sections
2. Modify all module manager constructors to accept config parameter
3. Remove all `process.env` reads from module files
4. Update `bootstrap.js` to pass config sections to each module
5. Update tests to inject mock config instead of mocking `process.env`

---

### Step 1.3: Create Constants Registry

**What to change:**
- Create `App/constants/index.js` to export all framework constants
- Extract table names, sensitive field lists, status codes, error messages

**Why it needs to change:**
- Magic strings scattered throughout codebase (`'sensors_data'`, `'users'`, etc.)
- Sensitive field arrays duplicated in `firebaseDB.js:556` and `cosmosDB.js:435`
- No autocomplete, typos cause runtime errors

**What part of framework it affects:**
- Database adapters (table names)
- All modules referencing status codes or predefined values

**What dependencies are impacted:**
- All files currently using hardcoded strings must import constants

**Implementation:**
```javascript
// App/constants/index.js
module.exports = {
  TABLES: {
    USERS: 'users',
    SENSORS: 'sensors_data',
    TEMPERATURE: 'temperature_data',
    PRESSURE: 'pressure_data',
    TASKS: 'tasks'
  },

  SENSITIVE_FIELDS: ['password', 'email', 'phone', 'address', 'name'],

  DB_TYPES: {
    MYSQL: 'mysql',
    FIREBASE: 'firestore',
    COSMOS: 'cosmosdb',
    HYBRID: 'hybrid'
  },

  STATUS_CODES: {
    SUCCESS: 'success',
    ERROR: 'error',
    PENDING: 'pending'
  }
};
```

**Migration steps:**
1. Create constants file with all identified magic strings
2. Update database adapters to use `TABLES.*` and `SENSITIVE_FIELDS`
3. Update `DatabaseManager` to use `DB_TYPES.*`
4. **CRITICAL:** Audit all table references and align to constants:
   - Search for `'sensor_data'`, `'sensors_data'`, `'sensors'` (common variants)
   - Update `databaseController.js` to use `TABLES.SENSORS`
   - Update `webSocketCommunicator.js` to use `TABLES.SENSORS`
   - Update `ipcManager.js` to use `TABLES.TEMPERATURE`, `TABLES.PRESSURE`
   - Verify API and WebSocket write to the **same table**
5. Search codebase for remaining hardcoded strings and replace
6. Add import statement: `const { TABLES, SENSITIVE_FIELDS } = require('../constants')`

---

## Phase 2: Fix Dependency Direction

### Step 2.1: Invert Database Dependency in Communicators

**What to change:**
- Remove direct database dependency from `WebSocketCommunicator` and `SerialCommunicator`
- Implement event emission pattern: communicators emit data events, managers handle persistence

**Why it needs to change:**
- Communicators currently call `this.db.postData()` directly, creating circular-like dependencies
- Communication modules (transport layer) should not own persistence responsibility
- Violates single responsibility: receiving data vs. storing data

**What part of framework it affects:**
- `App/modules/lib/com/webSocketCommunicator.js` (Lines 350-400)
- `App/modules/lib/com/serialCommunicator.js` (Lines 400-450)
- `App/modules/modules_config/websocket/websocketManager.js`
- `App/modules/modules_config/serial/serialManager.js`

**What dependencies are impacted:**
- Communicators no longer depend on Database
- Managers gain responsibility for subscribing to data events and persisting them

**Implementation:**
```javascript
// Before (webSocketCommunicator.js)
async handleSensorData(data) {
  const validated = this.validate(data);
  const encrypted = this.encrypt(validated);
  await this.db.postData('sensors', encrypted); // ❌ Direct DB call
  this.broadcast(encrypted);
}

// After (webSocketCommunicator.js)
async handleSensorData(data) {
  const validated = this.validate(data);
  this.emit('data:received', validated); // ✅ Emit event
  this.broadcast(validated);
}

// Manager handles persistence (websocketManager.js)
async initialize() {
  this.communicator.on('data:received', async (data) => {
    const encrypted = this.encryption.encrypt(data);
    await this.database.postData('sensors', encrypted);
  });
}
```

**Migration steps:**
1. Add EventEmitter to `WebSocketCommunicator` and `SerialCommunicator`
2. Replace `this.db.postData()` calls with `this.emit('data:received', data)`
3. Update managers to subscribe to `data:received` events
4. Move database persistence logic to manager layer
5. Remove database constructor parameter from communicators
6. Update tests to verify event emission instead of database calls

---

### Step 2.2: Decouple IPC from Serial Implementation

**What to change:**
- Remove direct `SerialManager` dependency from `IPCManager` constructor
- Implement message-based communication: IPC sends commands, doesn't call methods directly

**Why it needs to change:**
- `IPCManager` takes `SerialManager` as constructor argument and calls specific methods
- Tightly couples IPC layer to Serial API surface (if Serial refactors, IPC breaks)
- IPC acts as proxy rather than agnostic transport layer

**What part of framework it affects:**
- `App/modules/modules_config/ipc/ipcManager.js` (constructor and handler methods)
- `App/modules/modules_config/serial/serialManager.js`

**What dependencies are impacted:**
- IPCManager no longer imports or stores reference to SerialManager
- Serial becomes event-driven, responding to commands via event bus

**Implementation:**
```javascript
// Before (ipcManager.js)
constructor(databaseManager, serialManager) {
  this.database = databaseManager;
  this.serial = serialManager; // ❌ Direct coupling
}

setupSerialHandlers() {
  ipcMain.handle('serial-force-reconnect', () => {
    return this.serial.forceReconnect(); // ❌ Direct method call
  });
}

// After (ipcManager.js)
constructor(databaseManager, eventBus) {
  this.database = databaseManager;
  this.eventBus = eventBus; // ✅ Generic event bus
}

setupSerialHandlers() {
  ipcMain.handle('serial-force-reconnect', async () => {
    return await this.eventBus.emit('serial:command', {
      action: 'forceReconnect'
    });
  });
}

// serialManager.js subscribes to commands
initialize() {
  this.eventBus.on('serial:command', async ({ action, payload }) => {
    if (action === 'forceReconnect') {
      return await this.forceReconnect();
    }
  });
}
```

**Migration steps:**
1. Create simple EventBus utility in `App/modules/lib/events/EventBus.js`
2. Update `bootstrap.js` to create single EventBus instance
3. Pass EventBus to both IPCManager and SerialManager
4. Update IPC handlers to emit events instead of calling serial methods
5. Update SerialManager to subscribe to command events
6. Remove SerialManager constructor parameter from IPCManager
7. Test that IPC commands still work via event indirection

---

### Step 2.3: Remove Bootstrap Instance Leak

**What to change:**
- Stop exporting `bootstrapInstance` from `App/index.js`
- Export only the safe facade methods (getters)

**Why it needs to change:**
- Exposes internal initialization state machine to consumers
- Allows external code to interfere with startup sequence
- Callers can access uninitialized managers, bypassing safety checks

**What part of framework it affects:**
- `App/index.js` (export statement)

**What dependencies are impacted:**
- Any code importing `bootstrapInstance` directly must use facade methods instead

**Implementation:**
```javascript
// Before (App/index.js)
module.exports = {
  App,
  bootstrapInstance // ❌ Leaks internal state
};

// After (App/index.js)
module.exports = {
  App // ✅ Only expose facade
};
```

**Migration steps:**
1. Search codebase for imports of `bootstrapInstance`
2. Replace with facade method calls (e.g., `App.getDatabase()`)
3. Remove `bootstrapInstance` from exports
4. Verify no external code breaks

---

### Step 2.4: Decouple ApiServer from Application Controllers

**What to change:**
- Remove hardcoded controller imports from `App/modules/modules_config/api/apiServer.js`
- Create `App/Http/routes.js` that exports route definitions
- Pass routes to ApiServer via bootstrap initialization

**Why it needs to change:**
- Framework currently depends on application-specific controllers (`authController`, `mauiController`)
- If you copy the `App/` folder to a new project without these controllers, the framework crashes
- Violates framework/application separation: framework should handle HTTP mechanics, not know business routes

**What part of framework it affects:**
- `App/modules/modules_config/api/apiServer.js` (remove controller imports)
- `App/Http/routes.js` (new file)
- `App/bootstrap.js` (pass routes during API server initialization)

**What dependencies are impacted:**
- ApiServer no longer imports controllers
- Routes defined in application layer, passed to framework
- Bootstrap becomes the integration point

**Implementation:**
```javascript
// Before (apiServer.js) - ❌ Framework depends on Application
const authController = require('../../Http/Controllers/authController');
const mauiController = require('../../Http/Controllers/mauiController');

class APIServer {
  setupRoutes() {
    this.app.post('/api/auth/login', authController.login);
    this.app.post('/api/auth/register', authController.register);
    this.app.post('/api/maui-data', mauiController.genericDataHandler);
  }
}

// After (apiServer.js) - ✅ Framework accepts route configuration
class APIServer {
  constructor(config, logger, routes) {
    this.config = config;
    this.logger = logger;
    this.routes = routes; // ✅ Routes injected
  }

  setupRoutes() {
    // ✅ Framework doesn't know what routes exist
    if (typeof this.routes === 'function') {
      this.routes(this.app);
    }
  }
}

// New file: App/Http/routes.js (Application layer)
const authController = require('./Controllers/authController');
const mauiController = require('./Controllers/mauiController');
const databaseController = require('./Controllers/databaseController');

module.exports = function registerRoutes(app) {
  // Auth routes
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/register', authController.register);

  // Data routes
  app.post('/api/sensor-data', databaseController.insertSensorData);
  app.post('/api/maui-data', mauiController.genericDataHandler);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });
};

// Updated bootstrap.js
const routes = require('../Http/routes');

async init(modules = []) {
  if (modules.includes('api')) {
    this.apiServer = new APIServer(
      config.api,
      logger,
      routes // ✅ Pass application routes to framework
    );
    await this.apiServer.start();
  }
}
```

**Migration steps:**
1. Create `App/Http/routes.js` and move all route definitions from `apiServer.js`
2. Update `APIServer` constructor to accept `routes` parameter
3. Replace `setupRoutes()` method body to call `this.routes(this.app)`
4. Remove all controller imports from `apiServer.js`
5. Update `bootstrap.js` to load routes and pass to APIServer
6. Test all API endpoints still work
7. Verify framework can now be extracted to separate package

**Why this matters for reusability:**
- Framework: `App/modules/` can now be extracted to `@yourcompany/app-framework` npm package
- Application: `App/Http/`, `server.js`, `main.js` remain project-specific
- Clean boundary: Framework handles Express setup, Application defines business routes

---

## Phase 3: Clarify Authority & Responsibility

### Step 3.1: Consolidate Database Initialization

**What to change:**
- Remove dual initialization logic (Manager fallback + Adapter)
- Make `DatabaseAdapter` the **sole authority** for database connections
- Remove fallback logic from `DatabaseManager`

**Why it needs to change:**
- Both `databaseManager.js` (Lines 35-64) and `databaseAdapter.js` contain connection logic
- Creates two paths to a live database, causing confusion about which is actually running
- Updating connection logic in Adapter leaves Manager's fallback outdated

**What part of framework it affects:**
- `App/modules/modules_config/database/databaseManager.js`
- `App/modules/lib/db/databaseAdapter.js`

**What dependencies are impacted:**
- DatabaseManager becomes a simple facade over DatabaseAdapter
- All database operations route through Adapter

**Implementation:**
```javascript
// Before (databaseManager.js)
async initialize() {
  try {
    this.adapter = new DatabaseAdapter(this.config);
    await this.adapter.initialize();
  } catch (error) {
    // ❌ Fallback logic duplicates adapter responsibility
    if (this.config.type === 'firestore') {
      this.db = new FirebaseDB(this.config);
      await this.db.connect();
    }
  }
}

// After (databaseManager.js)
async initialize() {
  this.adapter = new DatabaseAdapter(this.config);
  await this.adapter.initialize();
  // ✅ No fallback, adapter is sole authority
}

// DatabaseAdapter handles all connection logic
async initialize() {
  switch (this.config.type) {
    case 'mysql':
      this.db = new MySQLDB(this.config);
      break;
    case 'firestore':
      this.db = new FirebaseDB(this.config);
      break;
    case 'cosmosdb':
      this.db = new CosmosDB(this.config);
      break;
    default:
      throw new Error(`Unsupported database type: ${this.config.type}`);
  }
  await this.db.connect();
}
```

**Migration steps:**
1. Move all connection fallback logic from `databaseManager.js` to `databaseAdapter.js`
2. Simplify `DatabaseManager.initialize()` to only instantiate and delegate to Adapter
3. Ensure Adapter throws clear errors if connection fails (no silent fallbacks)
4. Update error handling in `bootstrap.js` to catch and log adapter failures
5. Remove duplicate database driver instantiation from Manager

---

### Step 3.2: Replace AlertManager Singleton with Injected Logger

**What to change:**
- Remove global `AlertManager` singleton import from all modules
- Create `Logger` interface that modules receive via dependency injection
- Implement default logger that wraps AlertManager

**Why it needs to change:**
- AlertManager hardcoded into every module via direct import
- Framework assumes consuming application wants this specific logging implementation
- Impossible to inject custom logger for testing or different environments

**What part of framework it affects:**
- All modules currently importing `App/modules/lib/alert/alertManager.js`
- Bootstrap initialization (must create and inject logger)

**What dependencies are impacted:**
- Every module that logs must accept logger in constructor
- Bootstrap must instantiate logger once and pass to all modules

**Implementation:**
```javascript
// App/modules/lib/logging/Logger.js (interface)
class Logger {
  info(message, meta) { /* abstract */ }
  warn(message, meta) { /* abstract */ }
  error(message, meta) { /* abstract */ }
  debug(message, meta) { /* abstract */ }
}

// App/modules/lib/logging/AlertManagerLogger.js (default implementation)
class AlertManagerLogger extends Logger {
  constructor(alertManager) {
    super();
    this.alert = alertManager;
  }

  info(message, meta) {
    this.alert.log(message, 'info', meta);
  }

  error(message, meta) {
    this.alert.log(message, 'error', meta);
  }
}

// Modules receive logger via constructor
class DatabaseManager {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger; // ✅ Injected
  }

  async initialize() {
    this.logger.info('Initializing database...');
  }
}

// Bootstrap creates logger once
async init(modules) {
  const logger = new AlertManagerLogger(AlertManager);

  if (modules.includes('database')) {
    this.databaseManager = new DatabaseManager(config.database, logger);
  }
}
```

**Migration steps:**
1. Create `Logger` base class in `App/modules/lib/logging/`
2. Create `AlertManagerLogger` adapter that wraps existing AlertManager
3. Update all module constructors to accept `logger` parameter
4. Replace all `AlertManager.log()` calls with `this.logger.info()`
5. Update `bootstrap.js` to inject logger into all modules
6. Remove direct AlertManager imports from module files

---

### Step 3.3: Remove Runtime Type Checking ("Enhanced Adapter" Checks)

**What to change:**
- Remove runtime checks like `if (this.database.getDatabaseAdapter)` from `IPCManager` and `WebsocketManager`
- Establish clear interface contract for database dependency

**Why it needs to change:**
- Modules check internal structure of dependencies at runtime
- Violates Liskov Substitution Principle (modules change behavior based on implementation details)
- Indicates unclear interface contracts

**What part of framework it affects:**
- `App/modules/modules_config/ipc/ipcManager.js` (enhanced adapter checks)
- `App/modules/modules_config/websocket/websocketManager.js`

**What dependencies are impacted:**
- Database interface must be clearly defined
- All modules depend on explicit interface, not implementation

**Implementation:**
```javascript
// Before (ipcManager.js)
async getData(tableName, filters) {
  // ❌ Runtime type checking
  if (this.database.getDatabaseAdapter) {
    const adapter = this.database.getDatabaseAdapter();
    return await adapter.getDataByFilters(tableName, filters);
  } else {
    return await this.database.getDataByFilters(tableName, filters);
  }
}

// After (ipcManager.js)
async getData(tableName, filters) {
  // ✅ Database interface guarantees this method exists
  return await this.database.getDataByFilters(tableName, filters);
}

// Define explicit interface (DatabaseManager ensures this contract)
class DatabaseManager {
  // These methods MUST exist and delegate to adapter
  async getDataByFilters(table, filters) {
    return await this.adapter.getDataByFilters(table, filters);
  }

  async postData(table, data) {
    return await this.adapter.postData(table, data);
  }
}
```

**Migration steps:**
1. Document explicit interface for DatabaseManager (required methods)
2. Ensure DatabaseManager implements all methods, delegating to adapter
3. Remove all runtime type checks from consuming modules
4. Add interface validation during bootstrap (fail fast if contract violated)

---

## Phase 4: Fix Cross-Cutting Concerns

### Step 4.1: Centralize Validation Logic

**What to change:**
- Extract validation rules from `WebSocketCommunicator` and database adapters
- Create `App/modules/lib/validation/ValidationService.js`
- Define schemas once, reuse across all layers

**Why it needs to change:**
- Validation rules scattered across WebSocket layer (checking requiredFields) and DB layer
- Business rules about "valid sensor data" duplicated in transport and storage layers
- Potential desync where data passes one layer but fails the next

**What part of framework it affects:**
- `App/modules/lib/com/webSocketCommunicator.js` (validation logic)
- All database adapters (validation methods)

**What dependencies are impacted:**
- Communicators and adapters must import ValidationService
- Schemas defined centrally, referenced by name

**Implementation:**
```javascript
// App/modules/lib/validation/schemas.js
const Joi = require('joi');

module.exports = {
  sensorData: Joi.object({
    sample_id: Joi.string().required(),
    temperature: Joi.number().required(),
    humidity: Joi.number().required(),
    timestamp: Joi.date().default(Date.now)
  }),

  userData: Joi.object({
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  })
};

// App/modules/lib/validation/ValidationService.js
class ValidationService {
  constructor(schemas) {
    this.schemas = schemas;
  }

  validate(data, schemaName) {
    const schema = this.schemas[schemaName];
    if (!schema) {
      throw new Error(`Unknown schema: ${schemaName}`);
    }

    const { error, value } = schema.validate(data);
    if (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
    return value;
  }
}

// Usage in communicator
async handleSensorData(data) {
  const validated = this.validation.validate(data, 'sensorData');
  this.emit('data:received', validated);
}
```

**Design Decision: Config-Driven vs. Code-Based Validation**

The current system uses config-driven validation:
```javascript
// From .env or config
requiredFields: ['sample_id', 'temperature', 'humidity']
```

Moving to Joi schemas means validation becomes code-based:
```javascript
// In code
sensorData: Joi.object({
  sample_id: Joi.string().required(),
  temperature: Joi.number().required()
})
```

**Trade-offs:**

| Approach | Pros | Cons |
|----------|------|------|
| **Config-driven** (current) | Flexible, no code changes needed | No type validation, limited rules |
| **Code-based** (Joi) | Type safety, rich validation rules | Changes require code deployment |

**Recommended Approach: Hybrid**

For maximum flexibility while gaining type safety:

```javascript
// ValidationService supports both
class ValidationService {
  constructor(schemas) {
    this.schemas = schemas; // Joi schemas
    this.configSchemas = new Map(); // Dynamic schemas
  }

  // Code-based validation
  validate(data, schemaName) {
    const schema = this.schemas[schemaName];
    if (!schema) throw new Error(`Unknown schema: ${schemaName}`);
    return schema.validate(data);
  }

  // Config-driven validation (for backward compatibility)
  validateRequired(data, requiredFields) {
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    return data;
  }

  // Dynamic schema builder (bridges config and Joi)
  buildSchema(config) {
    const shape = {};
    for (const field of config.requiredFields || []) {
      shape[field] = Joi.any().required();
    }
    for (const field of config.optionalFields || []) {
      shape[field] = Joi.any().optional();
    }
    return Joi.object(shape);
  }
}
```

**Migration steps:**
1. Create ValidationService with both validation methods
2. Define core Joi schemas for known data types (sensor, user, task)
3. Add `buildSchema()` method for config-driven cases
4. Instantiate ValidationService in bootstrap
5. Inject validation service into communicators and managers
6. **Phase A:** Keep existing config-driven validation, use `validateRequired()`
7. **Phase B:** Gradually migrate to Joi schemas where stricter validation needed
8. Remove duplicate validation code from database adapters
9. Ensure all layers use ValidationService (not inline checks)

**When to use which:**
- Use **Joi schemas** for critical data (authentication, financial, sensor thresholds)
- Use **config-driven** for flexible/experimental fields that change frequently
- Use **buildSchema()** to bridge environments that need both

---

### Step 4.2: Decouple WindowManager from Frontend Structure

**What to change:**
- Remove hardcoded frontend path from `WindowManager` (`../../frontend/build/index.html`)
- Accept frontend entry point as configuration parameter

**Why it needs to change:**
- Framework "Core" knows specific directory structure of implementation project
- Assumes Create React App build output location
- Couples framework to specific frontend build tool

**What part of framework it affects:**
- `App/modules/modules_config/window/windowManager.js`

**What dependencies are impacted:**
- Configuration must include frontend entry point path
- Entry points must pass frontend path via config

**Implementation:**
```javascript
// Before (windowManager.js)
createWindow() {
  const indexPath = process.env.USE_REACT_FRONTEND
    ? path.join(__dirname, '../../frontend/build/index.html') // ❌ Hardcoded
    : path.join(__dirname, '../../public/index.html');

  mainWindow.loadFile(indexPath);
}

// After (windowManager.js)
constructor(config, logger) {
  this.config = config;
  this.logger = logger;
}

createWindow() {
  const indexPath = this.config.entryPoint; // ✅ From config
  if (!indexPath || !fs.existsSync(indexPath)) {
    throw new Error(`Frontend entry point not found: ${indexPath}`);
  }
  mainWindow.loadFile(indexPath);
}

// Configuration (config/index.js)
window: {
  entryPoint: process.env.FRONTEND_ENTRY_POINT ||
    path.join(__dirname, '../../frontend/build/index.html')
}
```

**Migration steps:**
1. Add `window.entryPoint` to configuration schema
2. Update `WindowManager` constructor to receive config
3. Replace hardcoded path with `this.config.entryPoint`
4. Add validation: throw error if entry point doesn't exist
5. Update `.env.example` to document `FRONTEND_ENTRY_POINT` variable

---

## Phase 5: Handle Side Effects & Lifecycle

### Step 5.1: Manage Event Subscription Lifecycle

**What to change:**
- Ensure all event subscriptions are properly cleaned up during shutdown
- Propagate shutdown signal from bootstrap to all modules
- Track subscriptions and unsubscribe automatically

**Why it needs to change:**
- `DatabaseAdapter` creates subscriptions but cleanup relies on manual `unsubscribeAll()` calls
- No automatic propagation of shutdown signal from bootstrap to Firestore listeners
- Risk of memory leaks or zombie listeners in Electron dev reloads

**What part of framework it affects:**
- `App/modules/lib/db/databaseAdapter.js` (subscription management)
- `App/bootstrap.js` (shutdown sequence)
- All modules with event listeners

**What dependencies are impacted:**
- Bootstrap must call cleanup methods on all modules
- Modules must implement cleanup/shutdown interface

**Implementation:**
```javascript
// Bootstrap ensures all modules clean up
async shutdown() {
  this.logger.info('Shutting down application...');

  // Shutdown in reverse order of initialization
  const shutdownOrder = [
    'window',
    'ipc',
    'websocket',
    'serial',
    'api',
    'database'
  ];

  for (const moduleName of shutdownOrder) {
    const manager = this[`${moduleName}Manager`];
    if (manager && typeof manager.shutdown === 'function') {
      try {
        await manager.shutdown();
        this.logger.info(`${moduleName} shutdown complete`);
      } catch (error) {
        this.logger.error(`Error shutting down ${moduleName}`, error);
      }
    }
  }
}

// DatabaseAdapter implements shutdown
async shutdown() {
  this.logger.info('Closing database connections...');

  // Unsubscribe all Firestore listeners
  await this.unsubscribeAll();

  // Close database connection
  if (this.db && typeof this.db.disconnect === 'function') {
    await this.db.disconnect();
  }
}

// Process handlers ensure clean shutdown
process.on('SIGINT', async () => {
  await bootstrap.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await bootstrap.shutdown();
  process.exit(0);
});
```

**Migration steps:**
1. Define shutdown interface: all modules must implement `shutdown()` method
2. Update bootstrap to call `shutdown()` on all modules in reverse initialization order
3. Implement `shutdown()` in all managers (database, websocket, serial, etc.)
4. Track all subscriptions in modules, unsubscribe during shutdown
5. Add process signal handlers to entry points (server.js, main.js)
6. Test shutdown sequence in development (Ctrl+C should cleanup properly)

---

### Step 5.2: Eliminate Global Process.env Dependencies

**What to change:**
- Remove all direct `process.env` reads from module constructors
- Inject configuration during initialization (already covered in Step 1.2, but ensure complete)

**Why it needs to change:**
- Global state dependency makes unit testing difficult
- Cannot instantiate multiple instances with different configs without mutating globals
- Tight coupling to Node.js environment (prevents framework reuse in other contexts)

**What part of framework it affects:**
- All modules reading `process.env` in constructors
- Database adapters instantiating with env vars

**What dependencies are impacted:**
- Bootstrap must resolve all config upfront
- Tests must inject config instead of mocking `process.env`

**Implementation:**
```javascript
// Before (mysqlDB.js)
constructor() {
  this.host = process.env.MYSQL_HOST || 'localhost'; // ❌ Global dependency
  this.port = process.env.MYSQL_PORT || 3306;
}

// After (mysqlDB.js)
constructor(config) {
  this.config = config; // ✅ Injected config
  this.host = config.host;
  this.port = config.port;
}

// Testing becomes easy
const mockConfig = { host: 'test-db', port: 9999 };
const db = new MySQLDB(mockConfig); // ✅ No global mutation needed
```

**Migration steps:**
1. Audit all files for `process.env` reads (use grep/search)
2. Update constructors to accept config objects
3. Move all env var reads to `config/index.js` (single place)
4. Update tests to inject mock config objects
5. Verify no module reads `process.env` directly (except config resolver)

---

## Phase 6: Structural Clarity

### Step 6.1: Resolve Module Naming Confusion

**What to change:**
- Rename `App/modules/modules_config/` to `App/modules/managers/`
- Update imports and documentation

**Why it needs to change:**
- Name `modules_config` implies configuration files, but contains core logic classes
- Makes file navigation confusing and intuitive searching difficult
- Developers expect managers in a `managers/` directory, not `modules_config/`

**What part of framework it affects:**
- Directory structure: `App/modules/modules_config/*`
- All imports referencing this path

**What dependencies are impacted:**
- All files importing from `modules_config/` must update paths
- Entry points (server.js, main.js) must update bootstrap imports

**Migration steps:**
1. Rename directory: `App/modules/modules_config/` → `App/modules/managers/`
2. Update all import statements (search for `modules_config` in codebase)
3. Update documentation and README references
4. Verify all modules still load correctly

---

### Step 6.2: Consolidate Communication Modules

**What to change:**
- Merge `App/modules/lib/com/` and related logic into clearer structure
- Separate protocol handlers from transport logic

**Why it needs to change:**
- Current structure mixes concerns (websocket server + data handling in one 988-line file)
- Poor separation between "how we receive data" (transport) and "what we do with data" (handling)

**What part of framework it affects:**
- `App/modules/lib/com/webSocketCommunicator.js`
- `App/modules/lib/com/serialCommunicator.js`

**What dependencies are impacted:**
- Managers must work with split components
- Event flow changes (already covered in Phase 2)

**Structural change:**
```
Before:
App/modules/lib/com/
  ├── webSocketCommunicator.js (988 lines - does everything)
  └── serialCommunicator.js (683 lines - does everything)

After:
App/modules/lib/transport/
  ├── websocket/
  │   ├── WebSocketServer.js (connection management)
  │   ├── WebSocketHandler.js (message routing)
  │   └── WebSocketAuth.js (authentication)
  └── serial/
      ├── SerialPort.js (port operations)
      ├── SerialParser.js (data parsing)
      └── SerialDetector.js (device discovery)
```

**Migration steps:**
1. Create new directory structure (`transport/websocket/`, `transport/serial/`)
2. Split webSocketCommunicator.js into focused classes (100-200 lines each)
3. Split serialCommunicator.js into focused classes
4. Update managers to compose new classes instead of monolithic communicators
5. Test each component independently
6. Remove old `com/` directory once migration complete

---

## Phase 7: Testing & Validation

### Step 7.1: Add Framework Integrity Tests

**What to change:**
- Create test suite that validates framework contracts
- Test that all modules implement required interfaces
- Validate dependency injection flows work correctly

**Why it needs to change:**
- No automated validation that framework architecture rules are followed
- Regression risks when refactoring
- Need to ensure improvements don't break existing behavior

**What part of framework it affects:**
- New test suite in `tests/framework/`

**What dependencies are impacted:**
- None (tests depend on framework, not vice versa)

**Implementation:**
```javascript
// tests/framework/module-interface.test.js
describe('Module Interface Contracts', () => {
  test('DatabaseManager implements required methods', () => {
    const manager = new DatabaseManager(mockConfig, mockLogger);
    expect(typeof manager.initialize).toBe('function');
    expect(typeof manager.shutdown).toBe('function');
    expect(typeof manager.getDataByFilters).toBe('function');
    expect(typeof manager.postData).toBe('function');
  });

  test('All managers accept config and logger', () => {
    // Test each manager constructor
    expect(() => new DatabaseManager()).toThrow(); // Missing config
    expect(() => new DatabaseManager(mockConfig)).toThrow(); // Missing logger
    expect(() => new DatabaseManager(mockConfig, mockLogger)).not.toThrow();
  });
});

// tests/framework/dependency-injection.test.js
describe('Dependency Injection', () => {
  test('Bootstrap injects config into all modules', async () => {
    const bootstrap = new AppBootstrap();
    await bootstrap.init(['database', 'websocket', 'serial']);

    // Verify all modules received config
    expect(bootstrap.databaseManager.config).toBeDefined();
    expect(bootstrap.websocketManager.config).toBeDefined();
    expect(bootstrap.serialManager.config).toBeDefined();
  });
});

// tests/framework/encryption.test.js
describe('Encryption Service', () => {
  test('Throws error if key is empty', () => {
    expect(() => new EncryptionService('')).toThrow();
    expect(() => new EncryptionService(null)).toThrow();
  });

  test('Encrypt/decrypt round-trip works', () => {
    const service = new EncryptionService('test-key-32-characters-long!');
    const original = 'sensitive data';
    const encrypted = service.encrypt(original);
    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(original);
  });
});
```

**Migration steps:**
1. Create test directory structure
2. Write tests for each phase's changes
3. Run tests after each migration step
4. Add CI integration to prevent regressions

---

## Implementation Order & Risk Assessment

### Recommended Implementation Sequence

**Week 1: Low Risk Foundation (Phase 1)**
1. Step 1.1: Centralize Encryption (✅ Safe - reduces duplication)
2. Step 1.3: Create Constants Registry (✅ Safe - additive change)
3. Step 1.2: Unify Configuration Access (⚠️ Medium - requires all modules update)

**Week 2: Dependency Fixes (Phase 2)**
4. Step 2.3: Remove Bootstrap Leak (✅ Safe - removes exposure)
5. Step 2.4: Decouple ApiServer from Controllers (⚠️ Medium - changes route registration)
6. Step 2.1: Invert Database Dependency (⚠️ Medium - changes data flow)
7. Step 2.2: Decouple IPC from Serial (⚠️ Medium - requires event bus)

**Week 3: Authority Clarification (Phase 3)**
8. Step 3.1: Consolidate Database Init (✅ Safe - removes duplication)
9. Step 3.3: Remove Runtime Type Checks (✅ Safe - simplifies code)
10. Step 3.2: Inject Logger (⚠️ Medium - touches all modules)

**Week 4: Cross-Cutting Concerns (Phase 4)**
11. Step 4.1: Centralize Validation (⚠️ Medium - requires schema migration)
12. Step 4.2: Decouple WindowManager (✅ Safe - config change only)

**Week 5: Lifecycle & Side Effects (Phase 5)**
13. Step 5.1: Manage Subscriptions (✅ Safe - additive shutdown logic)
14. Step 5.2: Eliminate process.env (✅ Safe - already covered in config step)

**Week 6: Structure & Testing (Phases 6-7)**
15. Step 6.1: Rename Directories (✅ Safe - structural only)
16. Step 6.2: Split Large Files (⚠️ High - major refactor, do last)
17. Step 7.1: Add Tests (✅ Safe - validation only)

---

## Risk Levels

- ✅ **Low Risk**: Additive changes, no behavior modification
- ⚠️ **Medium Risk**: Changes interfaces or data flow, requires testing
- 🔴 **High Risk**: Major refactors of large files, extensive testing needed

---

## Success Criteria

After completing this plan, the framework should have:

1. **Single Sources of Truth**
   - ✅ One encryption implementation
   - ✅ One configuration resolver
   - ✅ One constants registry
   - ✅ One validation schema set

2. **Clear Dependency Flow**
   - ✅ Communicators emit events, don't call database
   - ✅ IPC sends commands, doesn't call methods directly
   - ✅ ApiServer accepts routes, doesn't import controllers
   - ✅ Framework can be extracted without application code
   - ✅ No circular dependencies
   - ✅ All dependencies injected, not imported globally

3. **Well-Defined Authority**
   - ✅ DatabaseAdapter is sole database connection authority
   - ✅ EncryptionService is sole crypto authority
   - ✅ ConfigResolver is sole configuration authority
   - ✅ ValidationService is sole schema authority

4. **Clean Interfaces**
   - ✅ All modules implement shutdown()
   - ✅ All managers accept (config, logger, eventBus)
   - ✅ No runtime type checking
   - ✅ Clear interface contracts

5. **Testability**
   - ✅ All modules can be unit tested
   - ✅ No global state dependencies (except ConfigResolver)
   - ✅ Dependencies mockable via injection
   - ✅ Framework integrity tests pass

6. **Maintainability**
   - ✅ No file > 500 lines
   - ✅ Each class has single responsibility
   - ✅ Easy to find where logic lives
   - ✅ Clear module boundaries

---

## Appendix: Verification Checklist

### After Phase 1 (Single Sources of Truth)

**Critical Verifications:**
- [ ] **CRITICAL:** Verify `databaseController.js` imports and uses `TABLES.SENSORS` constant
- [ ] **CRITICAL:** Verify `webSocketCommunicator.js` uses `TABLES.SENSORS` constant
- [ ] **CRITICAL:** Both API and WebSocket write to the **same table name**
- [ ] **CRITICAL:** EncryptionService throws error if `DB_ENCRYPTION_KEY` is empty or missing
- [ ] **CRITICAL:** authController password hashing uses EncryptionService with same keys

**General Verifications:**
- [ ] All tests pass
- [ ] Application starts without errors
- [ ] Database adapters successfully use injected EncryptionService
- [ ] No hardcoded table names remain in code (search for `'sensor`, `'user`, etc.)
- [ ] All modules use ConfigResolver, no direct `process.env` reads

### After Phase 2 (Fix Dependency Direction)

**Critical Verifications:**
- [ ] **CRITICAL:** WebSocketCommunicator no longer has database dependency
- [ ] **CRITICAL:** SerialCommunicator emits events instead of calling database
- [ ] **CRITICAL:** apiServer.js has NO controller imports
- [ ] **CRITICAL:** Application can define routes without modifying framework

**General Verifications:**
- [ ] All API endpoints still work
- [ ] WebSocket connections function correctly
- [ ] Data persistence still works (via event handlers in managers)
- [ ] IPC commands work via EventBus
- [ ] Serial communication works (if hardware available)
- [ ] No `bootstrapInstance` exports in App/index.js

### After Phase 3 (Clarify Authority)

**Critical Verifications:**
- [ ] **CRITICAL:** DatabaseAdapter is sole database connection authority (no fallback in Manager)
- [ ] **CRITICAL:** All modules receive logger via injection (no direct AlertManager imports)
- [ ] **CRITICAL:** No runtime type checking (`if (this.database.getDatabaseAdapter)`) remains

**General Verifications:**
- [ ] Database connections succeed
- [ ] Logger injection works in all modules
- [ ] Tests can inject mock logger

### After Phase 4 (Cross-Cutting Concerns)

**Critical Verifications:**
- [ ] **CRITICAL:** All validation goes through ValidationService
- [ ] **CRITICAL:** Config-driven validation still works for dynamic fields
- [ ] **CRITICAL:** WindowManager uses config for frontend path (no hardcoded paths)

**General Verifications:**
- [ ] Validation errors provide clear messages
- [ ] Electron app loads correct frontend

### After Phase 5 (Lifecycle Management)

**Critical Verifications:**
- [ ] **CRITICAL:** Shutdown sequence executes without errors
- [ ] **CRITICAL:** All Firestore subscriptions unsubscribe on shutdown
- [ ] **CRITICAL:** No process.env reads outside ConfigResolver

**General Verifications:**
- [ ] Ctrl+C cleanly shuts down application
- [ ] No memory leaks during shutdown
- [ ] Database connections close properly

### After Phase 6 (Structural Clarity)

**Critical Verifications:**
- [ ] **CRITICAL:** Directory rename complete (no broken imports)
- [ ] **CRITICAL:** WebSocketCommunicator split into files < 300 lines each

**General Verifications:**
- [ ] All imports updated after rename
- [ ] Split files maintain original functionality

### After Phase 7 (Testing)

**Critical Verifications:**
- [ ] **CRITICAL:** Framework integrity tests pass
- [ ] **CRITICAL:** Interface contract tests pass

**General Verifications:**
- [ ] All unit tests pass
- [ ] Integration tests pass

### Final Pre-Production Checklist

- [ ] All phases completed
- [ ] All critical verifications passed
- [ ] No hardcoded strings (tables, paths, config)
- [ ] No global singleton imports (AlertManager, process.env)
- [ ] All dependencies injected
- [ ] Shutdown sequence tested
- [ ] Memory leak tests pass
- [ ] API endpoints tested
- [ ] WebSocket tested
- [ ] Database reads/writes tested
- [ ] Electron app tested (if applicable)
- [ ] Serial communication tested (if hardware available)
- [ ] Logs show no errors or warnings
- [ ] Documentation updated

---

## Document Version

**Version:** 1.1
**Date:** 2026-01-13
**Status:** Draft - Awaiting Implementation

**Revision History:**
- v1.1 (2026-01-13): Added Step 2.4 (Decouple ApiServer), enhanced Step 1.3 (table audit), enhanced Step 4.1 (validation hybrid approach), expanded verification checklist
- v1.0 (2026-01-13): Initial framework revision plan

---

## Next Steps

1. Review this plan with development team
2. Set up git branch for refactoring work
3. Begin with Phase 1, Step 1.1 (Encryption Service)
4. Execute one step at a time, testing thoroughly
5. Update this document with actual implementation notes
6. Track progress and document any deviations from plan
