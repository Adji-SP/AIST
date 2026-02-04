// App/Http/routes/routes.js
const authController = require('../Controllers/authController');
const mauiController = require('../Controllers/mauiController');
const databaseController = require('../Controllers/databaseController');

/**
 * Registers routes on the Express app
 * @param {Express.Application} app 
 * @param {DatabaseManager} db
 */
module.exports = function registerRoutes(app, db) {
    // Inject DB into controllers if needed
    // FIX: Method name mismatch - controllers export .initializeController(), not .init()
    authController.initializeController(db);
    mauiController.initializeController(db);
    databaseController.initializeController(db);

    // Define Routes
    app.post('/api/auth/register', authController.register);
    app.post('/api/auth/login', authController.login);
    
    app.get('/api/maui/data', mauiController.getData);
    
    app.post('/api/sensor/data', databaseController.insertSensorData);
    
    console.log('✅ App Routes Registered');
};