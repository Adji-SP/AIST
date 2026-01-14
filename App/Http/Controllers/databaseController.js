const DatabaseService = require('../../modules/lib/services/DatabaseService');
const { getInstance: getLogger } = require('../../modules/lib/services/LoggingService');

let databaseService;
let logger;

function initializeController(databaseInstance) {
    // FIX: Prevent Double-Wrapping
    // Check if it's already a DatabaseService (has .insert and .find methods)
    if (databaseInstance.insert && databaseInstance.find && typeof databaseInstance.insert === 'function') {
        // It's already a DatabaseService
        databaseService = databaseInstance;
    } else {
        // It's a raw database adapter, wrap it
        databaseService = new DatabaseService(databaseInstance);
    }
    logger = getLogger().child({ module: 'DatabaseController' });
}

async function insertSensorData(req, res) {
    const { user_id, device_id, ph_reading, temperature_reading, moisture_percentage } = req.body;

    try {
        logger.debug('Inserting sensor data', { user_id, device_id });

        // Use DatabaseService - handles validation and encryption automatically
        const result = await databaseService.insert('sensor_data', {
            user_id,
            device_id,
            ph_reading,
            temperature_reading,
            moisture_percentage
        }, {
            validate: false, // API validation handled separately if needed
            emit: true // Emit event for real-time updates
        });

        logger.info('Sensor data inserted successfully', { insertId: result.data.insertId });
        res.json({ success: true, id: result.data.insertId, message: "Data received via API and saved." });
    } catch (err) {
        logger.error('Failed to insert sensor data', { error: err.message });
        res.status(400).json({ success: false, error: err.message });
    }
}

async function insertPh(req, res) {
    const { user_id, device_id, ph_reading } = req.body;

    try {
        logger.debug('Inserting pH data', { user_id, device_id });

        // Use DatabaseService
        const result = await databaseService.insert('ph_data', {
            user_id,
            device_id,
            ph_reading
        }, {
            validate: false,
            emit: true
        });

        logger.info('pH data inserted successfully', { insertId: result.data.insertId });
        res.json({ success: true, id: result.data.insertId, message: "Data received via API and saved." });
    } catch (err) {
        logger.error('Failed to insert pH data', { error: err.message });
        res.status(400).json({ success: false, error: err.message });
    }
}

module.exports = {
    initializeController,
    insertSensorData
};