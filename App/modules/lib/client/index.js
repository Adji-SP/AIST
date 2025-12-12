// App/modules/lib/client/index.js
// Shared client library - Works in both browser and Node.js

const FirebaseClient = require('./firebaseClient');
const ApiClient = require('./apiClient');
const WebSocketClient = require('./websocketClient');

// Export everything
module.exports = {
    // Firebase
    FirebaseClient: FirebaseClient.FirebaseClient || FirebaseClient,
    getFirebaseClient: FirebaseClient.getFirebaseClient,

    // API
    ApiClient: ApiClient.ApiClient || ApiClient,
    getApiClient: ApiClient.getApiClient,

    // WebSocket
    WebSocketClient: WebSocketClient.WebSocketClient || WebSocketClient,
    getWebSocketClient: WebSocketClient.getWebSocketClient
};

// For ES6 imports (webpack will handle this)
module.exports.default = module.exports;
