import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.css'; // Your existing CSS - make sure this path is correct
// import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import App from './App.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);