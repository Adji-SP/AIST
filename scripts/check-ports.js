const net = require('net');

async function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.once('close', () => resolve({ port, available: true }));
            server.close();
        });
        server.on('error', () => resolve({ port, available: false }));
    });
}

async function checkAllPorts() {
    const ports = [3000, 5000, 5001, 8080, 8081];
    const results = await Promise.all(ports.map(checkPort));
    
    console.log('📊 Port Status:');
    results.forEach(result => {
        const status = result.available ? '✅ Available' : '❌ In Use';
        console.log(`  Port ${result.port}: ${status}`);
    });
    
    return results;
}

if (require.main === module) {
    checkAllPorts();
}

module.exports = { checkPort, checkAllPorts };
