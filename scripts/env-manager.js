// scripts/env-manager.js - Dynamic Environment Management System
const fs = require('fs');
const path = require('path');

class EnvironmentManager {
    constructor() {
        this.rootPath = path.join(__dirname, '..');
        this.envPath = path.join(this.rootPath, '.env');
        this.envDynamicPath = path.join(this.rootPath, '.env.dynamic');
        this.envExamplePath = path.join(this.rootPath, '.envExample');
        this.backupPath = path.join(this.rootPath, '.env.backup');
    }

    // Load and parse environment file
    loadEnvFile(filePath) {
        if (!fs.existsSync(filePath)) {
            return {};
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const env = {};
        
        content.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#') && line.includes('=')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=');
                env[key.trim()] = value.trim();
            }
        });

        return env;
    }

    // Save environment variables to file
    saveEnvFile(filePath, env, header = '') {
        let content = header ? `${header}\n\n` : '';
        
        Object.entries(env).forEach(([key, value]) => {
            content += `${key}=${value}\n`;
        });

        fs.writeFileSync(filePath, content, 'utf8');
    }

    // Create backup of current .env
    createBackup() {
        if (fs.existsSync(this.envPath)) {
            fs.copyFileSync(this.envPath, this.backupPath);
            console.log('📦 Created .env backup');
        }
    }

    // Restore from backup
    restoreBackup() {
        if (fs.existsSync(this.backupPath)) {
            fs.copyFileSync(this.backupPath, this.envPath);
            console.log('🔄 Restored .env from backup');
        }
    }

    // Detect current system configuration
    detectSystemConfig() {
        const config = {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            hasFirebaseTools: false,
            hasReactScripts: false,
            availablePorts: [],
            serialPorts: []
        };

        try {
            // Check if firebase-tools is installed
            require.resolve('firebase-tools');
            config.hasFirebaseTools = true;
        } catch (e) {}

        try {
            // Check if react-scripts is installed
            require.resolve('react-scripts');
            config.hasReactScripts = true;
        } catch (e) {}

        return config;
    }

    // Generate dynamic environment based on mode and system
    generateDynamicEnv(mode = 'both', systemConfig = null) {
        const baseEnv = this.loadEnvFile(this.envDynamicPath);
        const currentEnv = this.loadEnvFile(this.envPath);
        const systemConf = systemConfig || this.detectSystemConfig();

        // Merge configurations with current taking precedence for user settings
        const dynamicEnv = {
            ...baseEnv,
            ...currentEnv
        };

        // Override based on mode
        switch (mode) {
            case 'web':
                dynamicEnv.APP_MODE = 'web';
                dynamicEnv.USE_SERIAL = 'false';
                dynamicEnv.SERVE_STATIC = 'true';
                break;
            case 'electron':
                dynamicEnv.APP_MODE = 'electron';
                dynamicEnv.USE_SERIAL = 'true';
                dynamicEnv.SERVE_STATIC = 'false';
                break;
            case 'both':
                dynamicEnv.APP_MODE = 'both';
                dynamicEnv.USE_SERIAL = 'true';
                dynamicEnv.SERVE_STATIC = 'false';
                break;
        }

        // Ensure Firebase is enabled for real-time features
        dynamicEnv.USE_FIREBASE = 'true';

        // Set dynamic ports (check if available)
        dynamicEnv.API_PORT = dynamicEnv.API_PORT || '5001';
        dynamicEnv.PORT = dynamicEnv.PORT || '3000';
        dynamicEnv.WS_PORT = dynamicEnv.API_PORT; // WebSocket uses same port as API

        // Update dependent URLs
        const apiPort = dynamicEnv.API_PORT;
        const apiHost = dynamicEnv.API_HOST || 'localhost';
        
        dynamicEnv.API_BASE_URL = `http://${apiHost}:${apiPort}/api`;
        dynamicEnv.REACT_APP_API_URL = `http://${apiHost}:${apiPort}/api`;
        dynamicEnv.WS_URL = `ws://${apiHost}:${apiPort}/ws`;
        dynamicEnv.REACT_APP_WS_URL = `ws://${apiHost}:${apiPort}/ws`;

        // Platform-specific adjustments
        if (systemConf.platform === 'win32') {
            dynamicEnv.SERIAL_PORT = dynamicEnv.SERIAL_PORT || 'COM3';
        } else {
            dynamicEnv.SERIAL_PORT = dynamicEnv.SERIAL_PORT || '/dev/ttyUSB0';
        }

        return dynamicEnv;
    }

    // Update .env without overwriting user customizations
    updateEnvironment(mode = 'both', preserveUserSettings = true) {
        console.log(`🔧 Updating environment for mode: ${mode}`);

        // Create backup first
        this.createBackup();

        try {
            const systemConfig = this.detectSystemConfig();
            const dynamicEnv = this.generateDynamicEnv(mode, systemConfig);

            // Create header with timestamp and mode info
            const header = `# ================================================================= 
# IPCC FRAMEWORK ENVIRONMENT CONFIGURATION
# ================================================================= 
# Auto-generated on: ${new Date().toISOString()}
# Mode: ${mode.toUpperCase()}
# Platform: ${systemConfig.platform} ${systemConfig.arch}
# Node.js: ${systemConfig.nodeVersion}
# Firebase Tools: ${systemConfig.hasFirebaseTools ? 'Available' : 'Not Available'}
# React Scripts: ${systemConfig.hasReactScripts ? 'Available' : 'Not Available'}
# 
# This file is dynamically managed. Manual changes will be preserved
# unless they conflict with required system settings.
# =================================================================`;

            // Save the dynamic environment
            this.saveEnvFile(this.envPath, dynamicEnv, header);

            console.log('✅ Environment updated successfully');
            console.log(`📡 API Server: http://localhost:${dynamicEnv.API_PORT}`);
            console.log(`🌐 Frontend: http://localhost:${dynamicEnv.PORT}`);
            console.log(`📡 WebSocket: ws://localhost:${dynamicEnv.API_PORT}/ws`);
            console.log(`🔥 Firebase: ${dynamicEnv.USE_FIREBASE === 'true' ? 'Enabled' : 'Disabled'}`);

            return dynamicEnv;
        } catch (error) {
            console.error('❌ Error updating environment:', error);
            this.restoreBackup();
            throw error;
        }
    }

    // Validate environment configuration
    validateEnvironment() {
        const env = this.loadEnvFile(this.envPath);
        const issues = [];

        // Required variables
        const required = [
            'USE_FIREBASE',
            'API_PORT',
            'FIREBASE_DATABASE_URL',
            'FIREBASE_PROJECT_ID'
        ];

        required.forEach(key => {
            if (!env[key]) {
                issues.push(`Missing required variable: ${key}`);
            }
        });

        // Port conflicts
        if (env.API_PORT === env.PORT) {
            issues.push(`Port conflict: API_PORT and PORT cannot be the same (${env.API_PORT})`);
        }

        // Firebase configuration
        if (env.USE_FIREBASE === 'true') {
            const firebaseRequired = [
                'FIREBASE_API_KEY',
                'FIREBASE_AUTH_DOMAIN',
                'FIREBASE_DATABASE_URL',
                'FIREBASE_PROJECT_ID'
            ];

            firebaseRequired.forEach(key => {
                if (!env[key]) {
                    issues.push(`Missing Firebase configuration: ${key}`);
                }
            });
        }

        return {
            valid: issues.length === 0,
            issues,
            config: env
        };
    }

    // Show current configuration status
    showStatus() {
        const validation = this.validateEnvironment();
        const systemConfig = this.detectSystemConfig();

        console.log('\n🔍 ENVIRONMENT STATUS');
        console.log('='.repeat(50));
        
        console.log(`📊 Mode: ${validation.config.APP_MODE || 'Unknown'}`);
        console.log(`🔥 Firebase: ${validation.config.USE_FIREBASE === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`📡 API Port: ${validation.config.API_PORT || 'Not Set'}`);
        console.log(`🌐 Frontend Port: ${validation.config.PORT || 'Not Set'}`);
        console.log(`🔌 Serial: ${validation.config.USE_SERIAL === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
        
        console.log(`\n🖥️ System: ${systemConfig.platform} ${systemConfig.arch}`);
        console.log(`🟢 Node.js: ${systemConfig.nodeVersion}`);
        console.log(`🔧 Firebase Tools: ${systemConfig.hasFirebaseTools ? '✅' : '❌'}`);
        console.log(`⚛️ React Scripts: ${systemConfig.hasReactScripts ? '✅' : '❌'}`);

        if (!validation.valid) {
            console.log('\n⚠️ CONFIGURATION ISSUES:');
            validation.issues.forEach(issue => {
                console.log(`   - ${issue}`);
            });
        } else {
            console.log('\n✅ Configuration is valid');
        }

        console.log('='.repeat(50));
    }

    // Quick setup for different modes
    quickSetup(mode) {
        console.log(`🚀 Quick setup for ${mode.toUpperCase()} mode`);
        
        const env = this.updateEnvironment(mode);
        
        // Mode-specific instructions
        switch (mode) {
            case 'web':
                console.log('\n📋 WEB MODE SETUP COMPLETE');
                console.log('Run: npm run start:web-server (in one terminal)');
                console.log('Run: npm run start:web (in another terminal)');
                break;
            case 'electron':
                console.log('\n📋 ELECTRON MODE SETUP COMPLETE');
                console.log('Run: npm run start');
                break;
            case 'both':
                console.log('\n📋 HYBRID MODE SETUP COMPLETE');
                console.log('Run: npm run dev (starts both web and electron)');
                break;
        }

        console.log(`\n📡 Backend: http://localhost:${env.API_PORT}/api/health`);
        console.log(`🌐 Frontend: http://localhost:${env.PORT}`);
        console.log(`📡 WebSocket: ws://localhost:${env.API_PORT}/ws`);
    }
}

// CLI interface
if (require.main === module) {
    const envManager = new EnvironmentManager();
    const command = process.argv[2];
    const mode = process.argv[3] || 'both';

    switch (command) {
        case 'update':
            envManager.updateEnvironment(mode);
            break;
        case 'validate':
            envManager.validateEnvironment();
            break;
        case 'status':
            envManager.showStatus();
            break;
        case 'setup':
            envManager.quickSetup(mode);
            break;
        case 'backup':
            envManager.createBackup();
            break;
        case 'restore':
            envManager.restoreBackup();
            break;
        default:
            console.log(`
🔧 IPCC Framework Environment Manager

Usage: node scripts/env-manager.js <command> [mode]

Commands:
  update [mode]   Update environment configuration
  validate        Validate current configuration  
  status          Show configuration status
  setup [mode]    Quick setup for specific mode
  backup          Create backup of current .env
  restore         Restore from backup

Modes:
  web             Web-only mode (no electron/serial)
  electron        Electron-only mode (with serial)  
  both            Hybrid mode (default)

Examples:
  node scripts/env-manager.js setup web
  node scripts/env-manager.js update both
  node scripts/env-manager.js status
            `);
    }
}

module.exports = EnvironmentManager;