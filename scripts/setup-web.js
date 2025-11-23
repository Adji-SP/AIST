// scripts/setup-web.js - Setup script for web integration
const fs = require('fs');
const path = require('path');

class WebSetup {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.envWebPath = path.join(this.rootDir, '.env.web');
        this.envElectronPath = path.join(this.rootDir, '.env.electron');
        this.envPath = path.join(this.rootDir, '.env');
    }

    async setup() {
        console.log('🌐 Setting up web integration...\n');

        try {
            // 1. Create web server file
            await this.createWebServerFile();

            // 2. Setup environment files
            await this.setupEnvironmentFiles();

            // 3. Create React environment file
            await this.createReactEnvFile();

            // 4. Create API service file
            await this.ensureAPIServiceExists();

            // 5. Update your Overview component to use the new API
            await this.updateOverviewComponent();

            console.log('\n✅ Web integration setup complete!');
            console.log('\n📋 Next steps:');
            console.log('1. Run: npm run dev:web');
            console.log('2. Open: http://localhost:3000 (React app)');
            console.log('3. API runs on: http://localhost:5001');
            console.log('4. WebSocket on: ws://localhost:8081');

        } catch (error) {
            console.error('❌ Setup failed:', error);
            process.exit(1);
        }
    }

    async createWebServerFile() {
        const webServerContent = `// web-server.js - Auto-generated standalone web server
require('dotenv').config({ path: '.env.web' });

// Import your existing modular components
const DatabaseManager = require('./modules/database/databaseManager');
const APIServer = require('./modules/api/apiServer');
const ServiceManager = require('./modules/services/serviceManager');
const ProcessCoordinator = require('./modules/coordination/processCoordinator');
const WebsocketManager = require('./modules/websocket/websocketManager');
const express = require('express');
const path = require('path');

class WebApplication {
    constructor() {
        this.managers = {};
        this.serviceManager = new ServiceManager();
        this.coordinator = new ProcessCoordinator();
        this.isInitialized = false;
        this.port = process.env.API_PORT || 5001;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            console.log('🌐 Initializing Web Application...');
            
            const serviceStatus = await this.serviceManager.initializeServices(this.managers);
            
            const locks = {
                database: await this.coordinator.acquireServiceLock('database'),
                websocket: serviceStatus.wsEnabled ? await this.coordinator.acquireServiceLock('websocket') : false,
                api: await this.coordinator.acquireServiceLock('api')
            };

            await this._initializeDatabase();
            await this._initializeServices(locks);
            
            this.isInitialized = true;
            console.log('🚀 Web Application ready!');
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            await this.cleanup();
            process.exit(1);
        }
    }

    async _initializeDatabase() {
        this.managers.database = new DatabaseManager();
        await this.managers.database.initialize();
        console.log('✅ Database ready');
    }

    async _initializeServices(locks) {
        const db = this.managers.database.getDatabase();

        if (locks.websocket && process.env.USE_WS === 'true') {
            this.managers.websocket = new WebsocketManager(db, null);
            await this.managers.websocket.initialize();
        }

        if (locks.api) {
            this.managers.api = new APIServer(db, null, this.managers.websocket);
            this._setupStaticFileServing();
            this.managers.api.start();
        }
    }

    _setupStaticFileServing() {
        const app = this.managers.api.getApp();
        const buildPath = path.join(__dirname, 'build');
        
        app.use(express.static(buildPath));
        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
        
        app.get('*', (req, res) => {
            if (req.path.startsWith('/api/')) {
                return res.status(404).json({ success: false, error: 'API endpoint not found' });
            }
            res.sendFile(path.join(buildPath, 'index.html'));
        });
    }

    async cleanup() {
        if (!this.isInitialized) return;
        console.log('🔄 Cleaning up...');
        
        this.coordinator.releaseAllLocks();
        
        const cleanupPromises = [];
        if (this.managers.websocket) cleanupPromises.push(this.managers.websocket.cleanup());
        if (this.managers.api) cleanupPromises.push(this.managers.api.stop());
        if (this.managers.database) cleanupPromises.push(this.managers.database.close());

        await Promise.allSettled(cleanupPromises);
        console.log('✅ Cleanup complete');
    }
}

const webApp = new WebApplication();

// Graceful shutdown
process.on('SIGINT', async () => {
    await webApp.cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await webApp.cleanup();
    process.exit(0);
});

// Start the server
if (require.main === module) {
    webApp.initialize().catch(console.error);
}

module.exports = webApp;`;

        const webServerPath = path.join(this.rootDir, 'web-server.js');
        fs.writeFileSync(webServerPath, webServerContent);
        console.log('✅ Created web-server.js');
    }

    async setupEnvironmentFiles() {
        // Ensure .env.web exists with proper settings
        if (!fs.existsSync(this.envWebPath)) {
            const webEnvContent = `# Web Mode Configuration
USE_FIREBASE=true
USE_SERIAL=false
USE_WS=true
API_PORT=5001
WS_PORT=8081
APP_MODE=web
NODE_ENV=development

# Database Configuration (choose one)
MYSQL_HOST=localhost
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Web Server Configuration
SERVE_STATIC=true
FRONTEND_URL=http://localhost:3000
CORS_ENABLED=true`;

            fs.writeFileSync(this.envWebPath, webEnvContent);
            console.log('✅ Created .env.web');
        }

        // Ensure .env.electron exists
        if (!fs.existsSync(this.envElectronPath)) {
            const electronEnvContent = `# Electron Mode Configuration
USE_FIREBASE=true
USE_SERIAL=true
USE_WS=true
API_PORT=5000
WS_PORT=8080
SERIAL_PORT=/dev/ttyUSB0
APP_MODE=electron
NODE_ENV=development

# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com`;

            fs.writeFileSync(this.envElectronPath, electronEnvContent);
            console.log('✅ Created .env.electron');
        }
    }

    async createReactEnvFile() {
        const reactEnvContent = `# React App Environment Variables
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_WS_PORT=8081
REACT_APP_AUTO_CONNECT_WS=true
REACT_APP_MODE=web`;

        const reactEnvPath = path.join(this.rootDir, '.env.local');
        fs.writeFileSync(reactEnvPath, reactEnvContent);
        console.log('✅ Created .env.local for React');
    }

    async ensureAPIServiceExists() {
        const apiServicePath = path.join(this.rootDir, 'src', 'services', 'api.js');
        const servicesDir = path.join(this.rootDir, 'src', 'services');

        // Create services directory if it doesn't exist
        if (!fs.existsSync(servicesDir)) {
            fs.mkdirSync(servicesDir, { recursive: true });
            console.log('✅ Created src/services directory');
        }

        // Create API service if it doesn't exist
        if (!fs.existsSync(apiServicePath)) {
            const apiContent = `// src/services/api.js - Web API service
import webAPI from '../hook/webApi';

// Re-export for easier imports
export default webAPI;

// Named exports for convenience
export const {
    getDataByFilters,
    insertData,
    updateData,
    deleteData,
    getSerialStatus,
    forceReconnect,
    sendData,
    connectWebSocket,
    disconnectWebSocket,
    healthCheck
} = webAPI;

// API endpoints mapping
export const endpoints = {
    health: '/health',
    data: '/data',
    serial: '/serial',
    websocket: '/websocket',
    auth: '/auth'
};`;

            fs.writeFileSync(apiServicePath, apiContent);
            console.log('✅ Created API service file');
        }
    }

    async updateOverviewComponent() {
        const overviewPath = path.join(this.rootDir, 'src', 'components', 'dashboard', 'Overview.jsx');

        if (fs.existsSync(overviewPath)) {
            // Add import for the new hook at the top of the file
            let content = fs.readFileSync(overviewPath, 'utf8');

            if (!content.includes('useElectronAPI')) {
                // Add the import after the existing imports
                const importIndex = content.indexOf("import '../../styles/main.css';");
                if (importIndex !== -1) {
                    const insertPoint = content.indexOf('\n', importIndex) + 1;
                    const newImport = "import { useElectronAPI, useRealTimeData } from '../../hooks/useElectronAPI';\n";
                    content = content.slice(0, insertPoint) + newImport + content.slice(insertPoint);

                    fs.writeFileSync(overviewPath, content);
                    console.log('✅ Updated Overview.jsx with API hook import');
                }
            }
        }
    }
}

// Run setup
const setup = new WebSetup();
setup.setup().catch(console.error);