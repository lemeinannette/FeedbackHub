// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- Import BrowserRouter here
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* This is the ONLY Router in your app */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);