const fs = require('fs');
const path = require('path');

function cleanLocks() {
    const lockFile = path.join(__dirname, '../.service-locks');
    
    if (fs.existsSync(lockFile)) {
        try {
            let locks = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
            const activeLocks = {};
            
            // Check which processes are still running
            for (const [service, lock] of Object.entries(locks)) {
                try {
                    process.kill(lock.pid, 0);
                    activeLocks[service] = lock; // Process is still running
                } catch (error) {
                    console.log(`🧹 Cleaned stale lock for ${service} (PID ${lock.pid})`);
                }
            }
            
            fs.writeFileSync(lockFile, JSON.stringify(activeLocks, null, 2));
            console.log('✅ Lock cleanup completed');
        } catch (error) {
            console.error('Error cleaning locks:', error);
            // If there's an error, just remove the file
            fs.unlinkSync(lockFile);
            console.log('🗑️  Removed corrupted lock file');
        }
    } else {
        console.log('ℹ️  No lock file found');
    }
}

if (require.main === module) {
    cleanLocks();
}

module.exports = { cleanLocks };
