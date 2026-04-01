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
    try {
        // Support array payloads (batch uploads from offline logging mode)
        const payload = Array.isArray(req.body) ? req.body : [req.body];
        let errors = [];

        // Prepare insertion promises to execute them concurrently
        const insertPromises = payload.map(item => {
            const {
                user_id, device_id, timestamp,
                ph_reading, temperature_reading, moisture_percentage,
                temp, moisture, ph, ec, N, P, K
            } = item;

            // Resolve field values
            const resolvedPh      = ph_reading          ?? (ph       !== undefined ? Number(ph)       : null);
            const resolvedTemp    = temperature_reading  ?? (temp     !== undefined ? Number(temp)     : null);
            const resolvedMoist   = moisture_percentage  ?? (moisture !== undefined ? Number(moisture) : null);
            const resolvedEc      = ec   !== undefined ? Number(ec)   : null;
            const resolvedN       = N    !== undefined ? Number(N)    : null;
            const resolvedP       = P    !== undefined ? Number(P)    : null;
            const resolvedK       = K    !== undefined ? Number(K)    : null;
            const resolvedTs      = timestamp !== undefined ? Number(timestamp) : Math.floor(Date.now() / 1000);
            const resolvedUserId  = user_id !== undefined ? Number(user_id) : 0;

            // Validate
            if (!device_id || typeof device_id !== 'string' || device_id.length === 0 || device_id.length > 100) {
                errors.push('Invalid device_id');
                return null;
            }

            const sanitizedDeviceId = device_id.replace(/[<>"']/g, '');

            if (resolvedPh !== null && (isNaN(resolvedPh) || resolvedPh < 0 || resolvedPh > 14)) {
                errors.push(`Invalid ph for ${sanitizedDeviceId}`);
                return null;
            }
            if (resolvedTemp !== null && (isNaN(resolvedTemp) || resolvedTemp < -50 || resolvedTemp > 150)) {
                errors.push(`Invalid temp for ${sanitizedDeviceId}`);
                return null;
            }
            if (resolvedMoist !== null && (isNaN(resolvedMoist) || resolvedMoist < 0 || resolvedMoist > 100)) {
                errors.push(`Invalid moisture for ${sanitizedDeviceId}`);
                return null;
            }

            logger.debug('Inserting sensor data via batch', { device_id: sanitizedDeviceId });

            return databaseService.insert('sensor_data', {
                user_id:             resolvedUserId,
                device_id:           sanitizedDeviceId,
                timestamp:           resolvedTs,
                ph_reading:          resolvedPh,
                temperature_reading: resolvedTemp,
                moisture_percentage: resolvedMoist,
                ec_reading:          resolvedEc,
                nitrogen:            resolvedN,
                phosphorus:          resolvedP,
                potassium:           resolvedK,
            }, { validate: false, emit: true });
        });

        // Filter out nulls (failed validations) and run inserts concurrently
        const validPromises = insertPromises.filter(p => p !== null);
        await Promise.all(validPromises);

        const insertedCount = validPromises.length;

        if (insertedCount === 0 && errors.length > 0) {
            return res.status(400).json({ success: false, error: errors[0] });
        }

        logger.info(`Successfully inserted ${insertedCount} sensor records`);
        res.status(201).json({ success: true, message: `Data received and ${insertedCount} records saved.` });

    } catch (err) {
        logger.error('Failed to insert sensor data batch', { error: err.message });
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