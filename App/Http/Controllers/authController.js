const bcrypt = require('bcryptjs');
const DatabaseService = require('../../modules/lib/services/DatabaseService');
const { getInstance: getLogger } = require('../../modules/lib/services/LoggingService');

let databaseService;
let logger;

/**
 * Initializes the controller with a database instance.
 * This must be called once when the application starts.
 * @param {object} databaseInstance - The connected database instance or DatabaseService.
 */
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
    logger = getLogger().child({ module: 'AuthController' });
}

/**
 * Handles user login requests.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
async function login(req, res) {
    const { username, password } = req.body;

    try {
        logger.debug('Login attempt', { username });

        // Use DatabaseService to find user
        const users = await databaseService.find('users', { username });
        const user = users && users.length > 0 ? users[0] : null;

        if (!user) {
            logger.warn('Login failed - user not found', { username });
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (passwordIsValid) {
            logger.info('Login successful', { username, userId: user.id });
            const { password, ...userWithoutPassword } = user;
            res.status(200).json({ success: true, user: userWithoutPassword });
        } else {
            logger.warn('Login failed - invalid password', { username });
            res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }
    } catch (error) {
        logger.error('Login error', { username, error: error.message });
        res.status(500).json({ success: false, error: 'Internal server error during login.' });
    }
}

/**
 * Handles user registration requests.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
async function register(req, res) {
    const { username, password } = req.body;

    try {
        logger.debug('Registration attempt', { username });

        // Check if user already exists
        const existingUsers = await databaseService.find('users', { username });
        if (existingUsers && existingUsers.length > 0) {
            logger.warn('Registration failed - user already exists', { username });
            return res.status(409).json({ success: false, error: 'User with this email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            // role: 'user'
        };

        // Use DatabaseService to insert user
        const result = await databaseService.insert('users', newUser, {
            validate: false,
            emit: true
        });

        logger.info('Registration successful', { username, userId: result.data.insertId });
        res.status(201).json({ success: true, userId: result.data.insertId });

    } catch (error) {
        logger.error('Registration error', { username, error: error.message });
        res.status(500).json({ success: false, error: 'Internal server error during registration.' });
    }
}

module.exports = {
    initializeController,
    login,
    register,
};