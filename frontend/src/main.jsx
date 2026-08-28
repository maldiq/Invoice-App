import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { company } from './config/company';
import './index.css';

// Title default sudah di index.html; landing/login akan override via applySeo
document.title = company.seo?.title || company.appName;
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
