# Frontend Service Layer

This directory contains the **unified service layer** that connects your React frontend to the backend.

## 🎯 Purpose

The service layer provides a **mode-aware** interface that:
- ✅ Uses **IPC** in Electron mode (leverages backend services: encryption, validation, logging)
- ✅ Uses **REST API** in standalone mode
- ✅ Provides **consistent interface** regardless of mode
- ✅ Benefits from **all backend services** (DatabaseService, EventBus, LoggingService)

## 📁 Files

### `dataService.js` - Main Service (Use This!)

The unified data service that automatically detects and uses the appropriate communication method.

```javascript
import dataService from './services/dataService';

// Auto-detects: IPC (Electron) or REST API (Standalone)
const data = await dataService.getDataByFilters('sensors', {}, { limit: 50 });
const result = await dataService.insertData('sensors', { name: 'Sensor 1' });

// Mode detection
console.log(dataService.getMode()); // 'electron' or 'api'
console.log(dataService.isElectronMode()); // true or false
```

**Key Methods:**
- `getDataByFilters(table, filters, options)` - Query data
- `insertData(table, data)` - Insert data (auto-encrypted, validated, logged)
- `updateData(table, data, whereClause, whereParams)` - Update data
- `deleteData(table, whereClause, whereParams)` - Delete data
- `getSensorData(filters)` - Convenience method for sensor data
- `getSerialStatus()` - Get serial connection status (Electron only)
- `checkDatabaseConnection()` - Check database health

### `ipc.js` - Electron IPC Wrapper

Wraps Electron's IPC communication (window.api from preload.js).

**Used internally by dataService.js** when in Electron mode.

**Direct usage (if needed):**
```javascript
import ipcService from './services/ipc';

if (ipcService.isAvailable()) {
    const status = await ipcService.getSerialStatus();
    await ipcService.serialForceReconnect();
}
```

### `api.js` - REST API Client

REST API client for standalone mode (no Electron).

**Used internally by dataService.js** when in API mode.

**Direct usage (if needed):**
```javascript
import apiService from './services/api';

const data = await apiService.getDataByFilters('sensors', {}, { limit: 50 });
const health = await apiService.healthCheck();
```

## 🚀 Usage in React Components

### Recommended: Use React Hooks

```javascript
import { useData, useInsertData, useSensorData } from '../hook/useData';

function MyComponent() {
    // Fetch data from any table
    const { data, loading, error, refetch } = useData('sensors', {}, { limit: 50 });

    // Insert data
    const { insertData, loading: inserting } = useInsertData();

    const handleInsert = async () => {
        await insertData('sensors', { name: 'New Sensor' });
        refetch(); // Refresh data
    };

    // ... render UI
}
```

### Alternative: Direct Service Usage

```javascript
import dataService from '../services/dataService';

async function fetchSensors() {
    try {
        const data = await dataService.getDataByFilters('sensors', {}, { limit: 50 });
        console.log(data);
    } catch (error) {
        console.error('Failed to fetch:', error);
    }
}
```

## 🔄 Data Flow

### In Electron Mode

```
React Component
    ↓
useData hook
    ↓
dataService.js (detects 'electron' mode)
    ↓
ipc.js (window.api.getDataByFilters)
    ↓
IPC Channel (Electron)
    ↓
ipcManager.js (Backend)
    ↓
DatabaseService (encryption, validation)
    ↓
EventBus (events)
    ↓
LoggingService (logging)
    ↓
MySQL Database
```

### In Standalone Mode

```
React Component
    ↓
useData hook
    ↓
dataService.js (detects 'api' mode)
    ↓
api.js (fetch to REST API)
    ↓
HTTP Request
    ↓
Express API Server
    ↓
databaseController.js (Backend)
    ↓
DatabaseService (encryption, validation)
    ↓
EventBus (events)
    ↓
LoggingService (logging)
    ↓
MySQL Database
```

## ✅ Benefits

### 1. Backend Services Always Used

When you use this service layer, **all backend services are automatically utilized**:

- **DatabaseService**: Automatic encryption for sensitive fields
- **ValidationService**: Automatic data validation
- **EventBus**: Automatic event emission for real-time updates
- **LoggingService**: Structured logging for all operations

### 2. Mode-Aware

No need to change code when switching between Electron and standalone modes!

```javascript
// Same code works in both modes!
const data = await dataService.getDataByFilters('sensors', {}, { limit: 50 });
```

### 3. Clean Architecture

Components don't know or care about the communication method:

```javascript
// Component doesn't know if it's using IPC or REST API
function MyComponent() {
    const { data } = useData('sensors'); // Just works!
}
```

### 4. Easy Testing

Mock the service layer for testing:

```javascript
import dataService from '../services/dataService';

jest.mock('../services/dataService', () => ({
    getDataByFilters: jest.fn().mockResolvedValue([{ id: 1, name: 'Test' }])
}));
```

## 📖 Documentation

- **TUTORIAL.md** - Complete frontend integration tutorial with examples
- **FRONTEND_BACKEND_INTEGRATION_ANALYSIS.md** - Architecture analysis
- **COMPLETE_INTEGRATION_SUMMARY.md** - Full integration summary

## 🔧 Configuration

### Environment Variables

```bash
# .env or .env.local
REACT_APP_API_URL=http://localhost:3001  # For standalone mode
```

### Mode Detection

The service layer automatically detects the mode:

- **Electron mode**: Detected when `window.api` exists (from preload.js)
- **API mode**: Used when `window.api` is undefined (running in browser)

## 🐛 Troubleshooting

### Issue: "IPC is only available in Electron mode"

**Solution**: You're trying to use IPC-specific features in standalone mode.

```javascript
// Check mode before using Electron-only features
if (dataService.isElectronMode()) {
    const status = await dataService.getSerialStatus();
}
```

### Issue: "Failed to fetch: Network error"

**Solution**: Backend API server is not running or wrong URL.

1. Check if backend is running: `node server.js`
2. Check `REACT_APP_API_URL` environment variable
3. Check backend logs for errors

### Issue: Data is undefined or empty

**Solution**: Check response format.

```javascript
// dataService handles this automatically, but if using direct services:
const result = await ipcService.getDataByFilters('sensors', {}, {});
const data = result.success ? result.data : result;
```

## 📚 Examples

See `TUTORIAL.md` Section "Frontend Implementation" for:

- Complete component examples
- React hooks examples
- Serial status monitoring (Electron)
- Dashboard with real-time data
- Migration guide from Firestore to service layer

---

**Created**: 2024-01-14
**Status**: ✅ Ready to use
**Mode Support**: Electron (IPC) + Standalone (REST API)
