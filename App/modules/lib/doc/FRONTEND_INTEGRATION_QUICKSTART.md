# Frontend Integration Quick Start

Quick guide to using the new unified service layer in your React components.

## 📦 What Was Created

### Service Layer (`src/services/`)
- ✅ `ipc.js` - Electron IPC wrapper
- ✅ `api.js` - REST API client
- ✅ `dataService.js` - Unified service (use this!)
- ✅ `README.md` - Service layer documentation

### React Hooks (`src/hook/`)
- ✅ `useData.js` - Complete hooks for data operations

## 🚀 Quick Start

### 1. Use in Your React Components

**Before (Firestore direct access):**
```jsx
import { useFirestore } from './hook/useFirestoreClean';

function MyComponent() {
    const { data, loading, error } = useFirestore('sensors', { limit: 50 });
    // ❌ Bypasses backend services!
}
```

**After (Unified service layer):**
```jsx
import { useData } from './hook/useData';

function MyComponent() {
    const { data, loading, error, refetch } = useData('sensors', {}, { limit: 50 });
    // ✅ Uses backend services: encryption, validation, events, logging!
}
```

### 2. Insert Data

```jsx
import { useInsertData } from './hook/useData';

function CreateSensor() {
    const { insertData, loading } = useInsertData();

    const handleSubmit = async (formData) => {
        try {
            await insertData('sensors', formData);
            alert('Sensor created!');
        } catch (error) {
            alert('Failed: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* form fields */}
            <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Sensor'}
            </button>
        </form>
    );
}
```

### 3. Serial Status (Electron Only)

```jsx
import { useSerialStatus } from './hook/useData';
import dataService from '../services/dataService';

function SerialStatus() {
    const { status, loading, error, reconnect } = useSerialStatus();

    if (!dataService.isElectronMode()) {
        return <p>Serial only available in Electron mode</p>;
    }

    return (
        <div>
            <p>Status: {status?.connected ? 'Connected' : 'Disconnected'}</p>
            <p>Port: {status?.port}</p>
            <button onClick={reconnect}>Reconnect</button>
        </div>
    );
}
```

## 🎯 Key Features

### Mode-Aware
Automatically uses IPC (Electron) or REST API (Standalone):

```javascript
import dataService from './services/dataService';

// Automatically detects mode
console.log(dataService.getMode()); // 'electron' or 'api'

// Check if Electron
if (dataService.isElectronMode()) {
    // Electron-specific features
    const serialStatus = await dataService.getSerialStatus();
}
```

### Backend Services Integrated

All data operations benefit from:

- **DatabaseService**: Automatic encryption for sensitive fields
- **ValidationService**: Automatic validation
- **EventBus**: Automatic event emission
- **LoggingService**: Structured logging

### Complete CRUD Operations

```javascript
import dataService from './services/dataService';

// Create
await dataService.insertData('sensors', { name: 'Sensor 1' });

// Read
const sensors = await dataService.getDataByFilters('sensors', {}, { limit: 50 });

// Update
await dataService.updateData('sensors', { name: 'Updated' }, 'id = ?', [1]);

// Delete
await dataService.deleteData('sensors', 'id = ?', [1]);
```

## 📖 Full Examples

See **TUTORIAL.md** Section "Frontend Implementation" for:

1. **Service Layer Setup** - IPC, API, and unified service
2. **React Hooks** - Complete hooks with examples
3. **React Components** - SensorList, SerialStatus, Dashboard
4. **Migration Guide** - From Firestore to service layer

## 🔧 Testing

### Electron Mode (IPC)

```bash
# Start Electron app
npm run electron

# React will automatically use IPC
# Check console: "📡 DataService initialized in electron mode"
```

### Standalone Mode (REST API)

```bash
# Terminal 1: Start backend
node server.js

# Terminal 2: Start React
npm start

# React will automatically use REST API
# Check console: "📡 DataService initialized in api mode"
```

## 📝 Migration Checklist

- [ ] Replace `useFirestore` imports with `useData`
- [ ] Update hook calls to use new signature
- [ ] Test in Electron mode (IPC)
- [ ] Test in standalone mode (REST API)
- [ ] Verify backend services are working (check logs)
- [ ] Update components to use refetch() for manual refresh

## 🐛 Common Issues

### "IPC is only available in Electron mode"

**Solution**: Check mode before using Electron-only features:
```javascript
if (dataService.isElectronMode()) {
    // Electron-only code
}
```

### Backend services not being used

**Cause**: Still using Firestore directly
**Solution**: Replace `useFirestore` with `useData`

### Data not refreshing

**Solution**: Use the `refetch()` function:
```javascript
const { data, refetch } = useData('sensors');

// After insert/update/delete
await insertData('sensors', newData);
refetch(); // Refresh list
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **TUTORIAL.md** | Complete frontend integration tutorial |
| **FRONTEND_BACKEND_INTEGRATION_ANALYSIS.md** | Architecture analysis |
| **COMPLETE_INTEGRATION_SUMMARY.md** | Full integration summary |
| **src/services/README.md** | Service layer documentation |

## 💡 Pro Tips

1. **Use hooks, not direct service calls**:
   ```javascript
   // ✅ Good
   const { data } = useData('sensors');

   // ⚠️ Only if needed
   const data = await dataService.getDataByFilters('sensors', {}, {});
   ```

2. **Always handle loading and error states**:
   ```jsx
   const { data, loading, error } = useData('sensors');

   if (loading) return <Spinner />;
   if (error) return <Error message={error.message} />;
   return <DataDisplay data={data} />;
   ```

3. **Use refetch after mutations**:
   ```javascript
   await insertData('sensors', newData);
   refetch(); // Refresh the list
   ```

4. **Check mode for Electron-specific features**:
   ```javascript
   {dataService.isElectronMode() && <SerialStatus />}
   ```

---

**Status**: ✅ Ready to use
**Created**: 2024-01-14
**Next**: Start migrating your components!
