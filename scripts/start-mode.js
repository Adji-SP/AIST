require('dotenv').config();
const { spawn } = require('child_process');
const { checkAllPorts } = require('./check-ports');
const { cleanLocks } = require('./clean-locks');

async function startInMode(mode) {
    console.log(`🚀 Starting in ${mode} mode...`);
    
    // Clean up any stale locks first
    cleanLocks();
    
    // Check port availability
    const portStatus = await checkAllPorts();
    const electronRunning = !portStatus.find(p => p.port === 5000)?.available;
    
    switch (mode) {
        case 'electron-only':
            if (electronRunning) {
                console.log('⚠️  Electron seems to be already running on port 5000');
                console.log('   Use "npm run clean-locks" if this is incorrect');
                return;
            }
            spawn('npm', ['run', 'start:electron-only'], { stdio: 'inherit' });
            break;
            
        case 'web-only':
            if (electronRunning) {
                console.log('ℹ️  Electron detected - starting web in slave mode');
                spawn('npm', ['run', 'start:web-with-electron'], { stdio: 'inherit' });
            } else {
                spawn('npm', ['run', 'start:web-only'], { stdio: 'inherit' });
            }
            break;
            
        case 'both':
            spawn('npm', ['run', 'dev:both'], { stdio: 'inherit' });
            break;
            
        default:
            console.log('Available modes: electron-only, web-only, both');
    }
}

if (require.main === module) {
    const mode = process.argv[2] || 'web-only';
    startInMode(mode);
}

module.exports = { startInMode };
