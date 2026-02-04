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
        // FIX Issue #8: Comprehensive input validation

        // Validate user_id
        if (!user_id || !Number.isInteger(Number(user_id)) || user_id < 1 || user_id > 999999) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user_id - must be a positive integer between 1 and 999999'
            });
        }

        // Validate device_id
        if (!device_id || typeof device_id !== 'string' || device_id.length === 0 || device_id.length > 100) {
            return res.status(400).json({
                success: false,
                error: 'Invalid device_id - must be a non-empty string (max 100 characters)'
            });
        }

        // Sanitize device_id - prevent XSS
        const sanitizedDeviceId = device_id.replace(/[<>\"']/g, '');

        // Validate pH reading (optional field)
        if (ph_reading !== undefined && ph_reading !== null && ph_reading !== '') {
            const ph = Number(ph_reading);
            if (isNaN(ph) || ph < 0 || ph > 14) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ph_reading - must be a number between 0 and 14'
                });
            }
        }

        // Validate temperature reading (optional field)
        if (temperature_reading !== undefined && temperature_reading !== null && temperature_reading !== '') {
            const temp = Number(temperature_reading);
            if (isNaN(temp) || temp < -50 || temp > 150) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid temperature_reading - must be a number between -50 and 150 Celsius'
                });
            }
        }

        // Validate moisture percentage (optional field)
        if (moisture_percentage !== undefined && moisture_percentage !== null && moisture_percentage !== '') {
            const moisture = Number(moisture_percentage);
            if (isNaN(moisture) || moisture < 0 || moisture > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid moisture_percentage - must be a number between 0 and 100'
                });
            }
        }

        logger.debug('Inserting sensor data', { user_id, device_id: sanitizedDeviceId });

        // Use DatabaseService - handles validation and encryption automatically
        const result = await databaseService.insert('sensor_data', {
            user_id: Number(user_id),
            device_id: sanitizedDeviceId,
            ph_reading: ph_reading !== undefined ? Number(ph_reading) : null,
            temperature_reading: temperature_reading !== undefined ? Number(temperature_reading) : null,
            moisture_percentage: moisture_percentage !== undefined ? Number(moisture_percentage) : null
        }, {
            validate: false, // Already validated above
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
        // FIX Issue #8: Comprehensive input validation

        // Validate user_id
        if (!user_id || !Number.isInteger(Number(user_id)) || user_id < 1 || user_id > 999999) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user_id - must be a positive integer between 1 and 999999'
            });
        }

        // Validate device_id
        if (!device_id || typeof device_id !== 'string' || device_id.length === 0 || device_id.length > 100) {
            return res.status(400).json({
                success: false,
                error: 'Invalid device_id - must be a non-empty string (max 100 characters)'
            });
        }

        // Sanitize device_id - prevent XSS
        const sanitizedDeviceId = device_id.replace(/[<>\"']/g, '');

        // Validate pH reading (required field for this endpoint)
        if (ph_reading === undefined || ph_reading === null || ph_reading === '') {
            return res.status(400).json({
                success: false,
                error: 'pH reading is required'
            });
        }

        const ph = Number(ph_reading);
        if (isNaN(ph) || ph < 0 || ph > 14) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ph_reading - must be a number between 0 and 14'
            });
        }

        logger.debug('Inserting pH data', { user_id, device_id: sanitizedDeviceId });

        // Use DatabaseService
        const result = await databaseService.insert('ph_data', {
            user_id: Number(user_id),
            device_id: sanitizedDeviceId,
            ph_reading: ph
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