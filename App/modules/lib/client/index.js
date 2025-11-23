// App/modules/lib/client/index.js
// Shared client library - Works in both browser and Node.js

export { getFirebaseClient, default as FirebaseClient } from './firebaseClient';
export { getApiClient, default as ApiClient } from './apiClient';
export { getWebSocketClient, default as WebSocketClient } from './websocketClient';
