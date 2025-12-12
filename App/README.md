# Framework-Agnostic Backend Module

A truly modular, framework-agnostic backend that can be dropped into **any JavaScript project** - Electron, Express, Next.js, Vue, vanilla Node.js, and more.

## 🎯 Philosophy

This backend is **framework ignorant** - it doesn't care what frontend or framework you're using. It provides a clean, consistent API that works everywhere.

## 📁 Structure

```
App/
├── bootstrap.js              # Core initialization system
├── index.js                  # Main entry point & API
├── config/                   # Configuration system
│   ├── index.js             # Config resolver (environment-aware)
│   ├── craco.config.js      # React/CRA webpack config
│   └── README.md            # Config documentation
├── Http/                     # HTTP Controllers
│   └── Controllers/
│       ├── authController.js
│       ├── databaseController.js
│       └── mauiController.js
├── modules/                  # Core modules
│   ├── lib/                 # Shared libraries
│   │   ├── alert/           # Alert management
│   │   ├── client/          # API/WebSocket/Firebase clients
│   │   ├── com/             # Communication (Serial, WebSocket)
│   │   └── db/              # Database adapters
│   └── modules_config/      # Module managers
│       ├── api/             # API server manager
│       ├── database/        # Database manager
│       ├── ipc/             # IPC manager (Electron)
│       ├── serial/          # Serial port manager
│       ├── websocket/       # WebSocket manager
│       └── window/          # Window manager (Electron)
└── README.md                # This file
```

## 🚀 Quick Start

### Installation

Simply copy the entire `App/` directory into your project:

```bash
cp -r App/ /path/to/your/project/
```

### Basic Usage

```javascript
const App = require('./App');

// Bootstrap with your desired configuration
await App.bootstrap({
    mode: 'standalone',
    modules: {
        database: true,
        api: true
    }
});

// Use the modules
const db = App.database;
const api = App.api;
```

## 📖 Usage Examples

### 1. Electron Application

```javascript
// main.js
const { app } = require('electron');
const App = require('./App');

app.whenReady().then(async () => {
    await App.bootstrap({
        mode: 'electron',
        modules: {
            database: true,
            window: true,
            api: true,
            serial: true,
            websocket: true,
            ipc: true
        },
        electron: {
            app: app
        }
    });
});

app.on('window-all-closed', async () => {
    await App.shutdown();
    app.quit();
});
```

### 2. Express Server

```javascript
// server.js
const express = require('express');
const App = require('./App');

const server = express();

(async () => {
    // Initialize backend
    await App.bootstrap({
        mode: 'express',
        modules: {
            database: true,
            api: false,  // We're using Express directly
            websocket: true
        }
    });

    // Use the database in your routes
    server.get('/data', async (req, res) => {
        const db = App.database.getDatabase();
        const results = await db.query('SELECT * FROM data');
        res.json(results);
    });

    server.listen(3000, () => {
        console.log('Server running on port 3000');
    });
})();
```

### 3. Next.js API Route

```javascript
// pages/api/data.js
import App from '../../App';

// Initialize once
let initialized = false;

export default async function handler(req, res) {
    if (!initialized) {
        await App.bootstrap({
            mode: 'serverless',
            modules: {
                database: true,
                api: false
            }
        });
        initialized = true;
    }

    const db = App.database.getDatabase();
    const results = await db.query('SELECT * FROM data');

    res.status(200).json(results);
}
```

### 4. Standalone Node.js Script

```javascript
// script.js
const App = require('./App');

(async () => {
    await App.bootstrap({
        mode: 'standalone',
        modules: {
            database: true
        }
    });

    const db = App.database.getDatabase();
    const results = await db.query('SELECT * FROM users');

    console.log(results);

    await App.shutdown();
})();
```

### 5. React Frontend (Client-Side)

```javascript
// src/services/backend.js
import { lib } from '../App';

// Use the client libraries
const apiClient = lib.client.apiClient;
const wsClient = lib.client.websocketClient;

export const fetchData = async () => {
    const response = await apiClient.get('/data');
    return response.data;
};

export const connectWebSocket = () => {
    wsClient.connect('ws://localhost:3002');
};
```

## ⚙️ Configuration

### Bootstrap Options

```javascript
await App.bootstrap({
    // Operating mode
    mode: 'electron' | 'express' | 'standalone' | 'serverless',

    // Module selection
    modules: {
        database: true,    // Database connectivity
        api: true,         // REST API server
        serial: false,     // Serial port communication
        websocket: false,  // WebSocket server
        ipc: false,        // Inter-process communication (Electron)
        window: false      // Window management (Electron)
    },

    // Additional config
    config: {
        // Custom configuration overrides
    },

    // Electron-specific
    electron: {
        app: electronApp,
        window: browserWindow
    }
});
```

### Environment Variables

Create a `.env` file in your project root:

```env
# Database
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=monitor
DB_USER=root
DB_PASSWORD=

# API Server
API_PORT=3001
API_HOST=localhost

# WebSocket
WS_PORT=3002

# Environment
NODE_ENV=development
```

### Custom Configuration

```javascript
const App = require('./App');

// Get configuration for a module
const dbConfig = App.config.getConfig('database', {
    // Override defaults
    port: 3307,
    connectionLimit: 20
});

// Get all paths
const paths = App.config.getPaths();
console.log(paths.appDir);      // Path to App/
console.log(paths.modulesDir);  // Path to App/modules/
```

## 🔌 API Reference

### App.bootstrap(options)
Initialize the backend with specified configuration.

**Returns:** `Promise<App>`

### App.shutdown()
Cleanup and shutdown all modules.

**Returns:** `Promise<void>`

### App.isReady()
Check if backend is initialized.

**Returns:** `boolean`

### App.getMode()
Get current operating mode.

**Returns:** `string`

### App.getModule(name)
Get a specific module instance.

**Parameters:**
- `name` - 'database' | 'api' | 'serial' | 'websocket' | 'ipc' | 'window'

**Returns:** Module instance or `null`

### Property Accessors

```javascript
App.database       // DatabaseManager instance
App.api           // APIServer instance
App.serial        // SerialManager instance
App.websocket     // WebsocketManager instance
App.ipc           // IPCManager instance
App.window        // WindowManager instance
```

### Event System

```javascript
App.on('ready', () => {
    console.log('Backend ready!');
});

App.on('database:ready', (dbManager) => {
    console.log('Database connected');
});

App.on('error', (error) => {
    console.error('Backend error:', error);
});
```

**Available Events:**
- `ready` - Backend fully initialized
- `database:ready` - Database connected
- `api:ready` - API server started
- `serial:ready` - Serial manager initialized
- `websocket:ready` - WebSocket server started
- `ipc:ready` - IPC handlers registered
- `window:ready` - Window manager ready
- `shutdown` - Backend shut down
- `error` - Error occurred

## 🎨 Client Libraries

The backend includes client-side libraries that can be used in your frontend:

```javascript
import { lib } from './App';

// API Client
const data = await lib.client.apiClient.get('/endpoint');

// WebSocket Client
lib.client.websocketClient.connect('ws://localhost:3002');

// Firebase Client
await lib.client.firebaseClient.initialize();

// Alert Manager
lib.alert.show('Success!', 'success');

// Serial Communicator
const serial = lib.com.serialCommunicator;
```

## 📦 Portability

### To Use in a New Project:

1. **Copy the App directory:**
   ```bash
   cp -r App/ /path/to/new/project/
   ```

2. **Install peer dependencies** (if not already installed):
   ```bash
   npm install express socket.io mysql2 dotenv
   ```

3. **Bootstrap in your entry point:**
   ```javascript
   const App = require('./App');
   await App.bootstrap({ mode: 'standalone' });
   ```

4. **Done!** The backend is now integrated.

### Migration Checklist:

- [ ] Copy `App/` directory
- [ ] Copy `.env.example` and configure as `.env`
- [ ] Install peer dependencies
- [ ] Update entry point to use `App.bootstrap()`
- [ ] Test module initialization

## 🔧 Advanced Usage

### Custom Module Initialization

```javascript
// Manual initialization for fine-grained control
const { managers } = require('./App');

const dbManager = new managers.DatabaseManager();
await dbManager.initialize();

const apiServer = new managers.APIServer(dbManager.getDatabase());
await apiServer.start();
```

### Conditional Module Loading

```javascript
await App.bootstrap({
    mode: 'standalone',
    modules: {
        database: process.env.ENABLE_DB === 'true',
        api: process.env.ENABLE_API === 'true',
        serial: process.platform !== 'darwin' // Skip on macOS
    }
});
```

### Multiple Instances

```javascript
const { AppBootstrap } = require('./App/bootstrap');

const instance1 = new AppBootstrap();
await instance1.bootstrap({ mode: 'standalone' });

const instance2 = new AppBootstrap();
await instance2.bootstrap({ mode: 'standalone' });
```

## 🧪 Testing

```javascript
// test.js
const App = require('./App');

beforeAll(async () => {
    await App.bootstrap({
        mode: 'standalone',
        modules: { database: true }
    });
});

afterAll(async () => {
    await App.shutdown();
});

test('database connection', async () => {
    const db = App.database.getDatabase();
    expect(db).toBeDefined();
});
```

## 📝 Best Practices

1. **Always call `App.shutdown()`** when your application closes
2. **Use environment variables** for configuration
3. **Enable only required modules** to reduce overhead
4. **Handle errors** using the event system
5. **Check `App.isReady()`** before accessing modules

## 🤝 Contributing

This module is designed to be self-contained and framework-agnostic. When adding features:

1. Don't assume any specific framework
2. Use configuration for environment-specific behavior
3. Emit events for important lifecycle changes
4. Keep dependencies minimal

## 📄 License

MIT - This module can be used in any project, commercial or open-source.

---

**Made for developers who value modularity and flexibility.**
