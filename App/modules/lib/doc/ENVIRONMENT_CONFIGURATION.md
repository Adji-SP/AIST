# Environment Configuration Guide

## Overview

This guide covers all environment variables used in the Monitor Framework application. All configuration is done through a single `.env` file in the project root.

---

## 📋 Complete Environment Variables Reference

### Application Environment

```env
# Application Environment
NODE_ENV=development              # Options: development, production
ELECTRON_ENV=false                # Set to true when running in Electron
```

### Frontend Configuration

```env
# Frontend Configuration
USE_REACT_FRONTEND=true           # true = React UI, false = traditional HTML
REACT_DEV_URL=http://localhost:3000  # React dev server URL
OPEN_DEVTOOLS=true                # Open Chrome DevTools on startup (development only)
```

**Notes:**
- When `USE_REACT_FRONTEND=true`:
  - In production: Loads from `frontend/build/index.html`
  - In development: Connects to `REACT_DEV_URL` (React dev server)
- When `USE_REACT_FRONTEND=false`:
  - Loads traditional HTML from `resource/view/layout/index.html`
  - Falls back to auto-generated HTML if file doesn't exist

### Server Configuration

```env
# Server Configuration
SERVER_PORT=3000                  # Main web server port
SERVER_HOST=localhost             # Server host
CORS_ORIGIN=*                     # CORS allowed origins

# API Server Configuration
API_PORT=3001                     # REST API server port (used by APIServer)
```

### WebSocket Configuration

```env
# WebSocket Configuration (New Format)
WEBSOCKET_PORT=8080               # WebSocket server port
WEBSOCKET_HOST=0.0.0.0            # WebSocket host (0.0.0.0 = all interfaces)
WEBSOCKET_ENABLE_AUTH=false       # Enable WebSocket authentication
WEBSOCKET_AUTH_TOKEN=             # Authentication token (if enabled)
WEBSOCKET_DB_TABLE_NAME=sensors_data  # Default table for WebSocket data
WEBSOCKET_REQUIRED_FIELDS=        # Comma-separated required fields
WEBSOCKET_FIELDS_TO_ENCRYPT=      # Comma-separated fields to encrypt
WEBSOCKET_ENABLE_HEARTBEAT=true   # Enable heartbeat/ping
WEBSOCKET_HEARTBEAT_INTERVAL=30000  # Heartbeat interval (ms)
WEBSOCKET_MAX_CONNECTIONS=10      # Maximum concurrent connections
WEBSOCKET_ENABLE_VALIDATION=true  # Enable data validation
WEBSOCKET_LOG_LEVEL=info          # Logging level: debug, info, warn, error

# Legacy WebSocket Config (for compatibility)
WS_PORT=8080
WS_HOST=localhost
WS_PATH=/ws
WS_HEARTBEAT_INTERVAL=30000
WS_RECONNECT_DELAY=5000
WS_MAX_RECONNECT_ATTEMPTS=5
WS_COMPRESSION=true
WS_CORS_ORIGIN=*
```

### Database Configuration

```env
# Database Configuration
# Options: mysql, firestore, cosmosdb, hybrid, hybrid-cosmos
# Note: 'firebase' is also accepted as alias for 'firestore'
DB_TYPE=firestore

# Legacy backward compatibility (optional - if DB_TYPE not set)
USE_FIREBASE=true                 # Old format, still supported
```

**Database Type Options:**
- `mysql` - MySQL database only
- `firestore` or `firebase` - Firebase/Firestore only
- `cosmosdb` - Azure Cosmos DB only
- `hybrid` - MySQL (primary) + Firebase (secondary, auto-sync)
- `hybrid-cosmos` - MySQL (primary) + Cosmos DB (secondary, auto-sync)

#### MySQL Configuration

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=monitor_framework_db
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000
```

#### Firebase/Firestore Configuration

```env
# Firebase/Firestore Configuration (when DB_TYPE=firestore or hybrid)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/your/service-account-key.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
USE_FIRESTORE=true

# Firebase Client SDK (alternative to service account)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

#### Azure Cosmos DB Configuration

```env
# Azure Cosmos DB Configuration (when DB_TYPE=cosmosdb or hybrid-cosmos)
# MongoDB API - Collection-based like Firebase
COSMOS_CONNECTION_STRING=mongodb://your-account:your-key@your-account.mongo.cosmos.azure.com:10255/?ssl=true
# OR use account credentials
COSMOS_ACCOUNT_NAME=your-cosmos-account
COSMOS_ACCOUNT_KEY=your-cosmos-key
COSMOS_DATABASE=monitor_db
```

### Serial Communication Configuration

```env
# Serial Communication Configuration
SERIAL_PORT=COM3                  # Serial port (COM3, /dev/ttyUSB0, etc.)
SERIAL_BAUDRATE=9600              # Baud rate (used by serialManager)
SERIAL_BAUD_RATE=9600             # Alternative name (legacy)
SERIAL_LINE_DELIMITER=\r\n        # Line delimiter for serial data
SERIAL_DATA_TYPES=json-object     # Data format: json-object, csv, raw
SERIAL_DB_TABLE_NAME=sensors_table  # Target database table
SERIAL_REQUIRED_FIELDS=           # Comma-separated required fields
SERIAL_FIELD_TO_ENCRYPT=          # Comma-separated fields to encrypt
SERIAL_DATA_BITS=8
SERIAL_STOP_BITS=1
SERIAL_PARITY=none
SERIAL_AUTO_OPEN=true
SERIAL_HIGH_WATER_MARK=65536
```

### Security Configuration

```env
# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=24h
DB_ENCRYPTION_KEY=your-database-encryption-key-here
BCRYPT_ROUNDS=10
SESSION_SECRET=your-session-secret-here
```

### Logging Configuration

```env
# Logging Configuration
LOG_LEVEL=info                    # debug, info, warn, error
LOG_FILE_ENABLED=true
LOG_FILE_NAME=app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5
LOG_CONSOLE_ENABLED=true
LOG_COLORIZE=true
```

### Rate Limiting

```env
# Rate Limiting
RATE_LIMIT_WINDOW=900000          # Time window in ms (15 minutes)
RATE_LIMIT_MAX=100                # Max requests per window
```

### Feature Flags

```env
# Feature Flags
FEATURE_WEBSOCKET=true
FEATURE_SERIAL=true
FEATURE_FIRESTORE=false
FEATURE_ENCRYPTION=true
FEATURE_AUTH=true
FEATURE_REALTIME_SYNC=true
USE_FIREBASE=true
```

---

## 🔧 Recent Configuration Updates

### 1. Frontend Configuration (NEW)

Added support for React frontend with environment variables:

```env
USE_REACT_FRONTEND=true
REACT_DEV_URL=http://localhost:3000
OPEN_DEVTOOLS=true
```

**File:** `App/modules/config/window/windowManager.js`

**Changes:**
- Added `USE_REACT_FRONTEND` check to toggle between React and HTML
- Auto-detects React build vs dev server
- Creates fallback HTML if no UI found

### 2. Database Type Alias (NEW)

Added support for `firebase` as alias for `firestore`:

```env
# Both are now valid:
DB_TYPE=firebase    # ← Automatically converts to 'firestore'
DB_TYPE=firestore   # ← Direct usage
```

**File:** `App/modules/config/database/databaseManager.js`

**Changes:**
- Constructor now converts `DB_TYPE=firebase` to `firestore` internally
- Maintains backward compatibility with `USE_FIREBASE` variable
- Supports all database types: mysql, firestore/firebase, cosmosdb, hybrid, hybrid-cosmos

### 3. Fixed Preload Path (FIXED)

Fixed incorrect path to preload.js in windowManager:

**Before:**
```javascript
preload: path.join(__dirname, '../../preload.js'),  // ❌ Wrong path
```

**After:**
```javascript
preload: path.join(__dirname, '../../../../preload.js'),  // ✅ Correct path
```

**File:** `App/modules/config/window/windowManager.js:19`

### 4. Unified WebSocket Configuration (NEW)

Added all WebSocket configuration variables that match `websocketManager.js`:

```env
WEBSOCKET_PORT=8080
WEBSOCKET_HOST=0.0.0.0
WEBSOCKET_ENABLE_AUTH=false
WEBSOCKET_AUTH_TOKEN=
WEBSOCKET_DB_TABLE_NAME=sensors_data
# ... and more (see WebSocket Configuration section above)
```

### 5. Serial Configuration Updates (NEW)

Added all serial configuration variables that match `serialManager.js`:

```env
SERIAL_BAUDRATE=9600              # NEW: Used by serialManager
SERIAL_LINE_DELIMITER=\r\n        # NEW: Line delimiter
SERIAL_DATA_TYPES=json-object     # NEW: Data format
SERIAL_DB_TABLE_NAME=sensors_table  # NEW: Target table
SERIAL_REQUIRED_FIELDS=           # NEW: Validation
SERIAL_FIELD_TO_ENCRYPT=          # NEW: Security
```

### 6. API Port Configuration (NEW)

Added dedicated API server port:

```env
API_PORT=3001                     # Used by APIServer
```

**File:** `App/modules/config/api/apiServer.js`

---

## 📁 File Structure

All backend modules are located in the `App/` directory:

```
App/
├── Http/
│   └── Controllers/              # API Controllers
│       ├── authController.js
│       ├── databaseController.js
│       └── mauiController.js
├── modules/
│   ├── config/                   # Configuration Managers
│   │   ├── api/
│   │   │   └── apiServer.js     # REST API Server
│   │   ├── database/
│   │   │   └── databaseManager.js  # Database Manager
│   │   ├── ipc/
│   │   │   └── ipcManager.js    # Electron IPC Handlers
│   │   ├── serial/
│   │   │   └── serialManager.js # Serial Communication
│   │   ├── websocket/
│   │   │   └── websocketManager.js  # WebSocket Server
│   │   └── window/
│   │       └── windowManager.js # Electron Window Manager
│   └── lib/                      # Core Libraries
│       ├── alert/                # Alert System
│       ├── com/                  # Communication (Serial/WebSocket)
│       ├── db/                   # Database Drivers
│       └── doc/                  # Documentation (THIS FILE!)
```

---

## 🚀 Quick Configuration Templates

### Template 1: Electron + React + Firebase

```env
NODE_ENV=development
ELECTRON_ENV=true
USE_REACT_FRONTEND=true
REACT_DEV_URL=http://localhost:3000
OPEN_DEVTOOLS=true

DB_TYPE=firestore
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com

API_PORT=3001
WEBSOCKET_PORT=8080
SERIAL_PORT=COM3
```

### Template 2: Web Server + MySQL

```env
NODE_ENV=production
ELECTRON_ENV=false
USE_REACT_FRONTEND=true

DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=monitor_db

API_PORT=3001
SERVER_PORT=3000
```

### Template 3: Hybrid Mode (MySQL + Cosmos DB)

```env
NODE_ENV=production
USE_REACT_FRONTEND=true

DB_TYPE=hybrid-cosmos
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=monitor_db

COSMOS_CONNECTION_STRING=mongodb://...

API_PORT=3001
```

---

## ⚠️ Important Notes

1. **Single .env File**: All configuration is in one `.env` file at project root
2. **No File Splitting**: Do not create separate env files (`.env.development`, `.env.production`, etc.)
3. **Backend in App/**: All backend code is organized under the `App/` directory
4. **Documentation**: All documentation is in `App/modules/lib/doc/`
5. **Path Fixes**: The preload.js path issue has been fixed in `windowManager.js`

---

## 🔍 Troubleshooting

### Issue: "Cannot find preload.js"

**Solution:** Already fixed in `windowManager.js:19`
- Path corrected from `../../preload.js` to `../../../../preload.js`

### Issue: "DB_TYPE 'firebase' not supported"

**Solution:** Already fixed in `databaseManager.js`
- `firebase` is now accepted as alias for `firestore`
- Automatically converts internally

### Issue: "WEBSOCKET_PORT is undefined"

**Solution:** Add to `.env`:
```env
WEBSOCKET_PORT=8080
WEBSOCKET_HOST=0.0.0.0
```

### Issue: "React frontend not loading"

**Solution:** Check configuration:
```env
USE_REACT_FRONTEND=true
REACT_DEV_URL=http://localhost:3000
```

Make sure:
- React dev server is running (`npm run dev:frontend`)
- Or React build exists (`npm run build:frontend`)

---

## 📚 Related Documentation

- **Configuration Compatibility**: `CONFIGURATION_COMPATIBILITY.md`
- **Database Setup**: `DATABASE_DOCUMENTATION.md`, `FIREBASE_DOCUMENTATION.md`
- **Azure Cosmos DB**: `AZURE_QUICK_START.md`
- **Serial Communication**: `SERIAL_DOCUMENTATION.md`
- **WebSocket**: `WEBSOCKET_DOCUMENTATION.md`
- **Architecture**: `INTEGRATION_SUMMARY.md`, `ARCHITECTURE_DIAGRAM.md`

---

## ✅ Configuration Checklist

Before running the application:

- [ ] `.env` file exists in project root
- [ ] `DB_TYPE` is set (or `USE_FIREBASE` for legacy)
- [ ] Database credentials are configured
- [ ] `USE_REACT_FRONTEND` is set
- [ ] `API_PORT` is set (default: 3001)
- [ ] Serial port configured (if using serial communication)
- [ ] WebSocket port configured (if using WebSocket)
- [ ] All security keys are set (JWT_SECRET, DB_ENCRYPTION_KEY, etc.)

---

**Last Updated:** 2024-11-13
**Related Files Modified:**
- `App/modules/config/window/windowManager.js` (preload path fix)
- `App/modules/config/database/databaseManager.js` (firebase alias support)
- `.env` (comprehensive configuration)
