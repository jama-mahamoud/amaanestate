import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Global resilience handlers to swallow local development HMR/WebSocket disconnect errors
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const errorStr = args.map(arg => String(arg)).join(' ');
    if (
      errorStr.includes('WebSocket') || 
      errorStr.includes('[vite]') || 
      errorStr.includes('failed to connect to websocket') ||
      errorStr.includes('WebSocket closed') ||
      errorStr.includes('WebSocket closed without opened')
    ) {
      // Quietly log to avoid modal or overlay crashes
      console.warn('[Vite Dev WebSocket Suppressed]', ...args);
      return;
    }
    originalError(...args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonStr = reason ? (reason.message || String(reason)) : '';
    if (
      reasonStr.includes('WebSocket') || 
      reasonStr.includes('[vite]') || 
      reasonStr.includes('websocket') ||
      reasonStr.includes('reconnect') ||
      reasonStr.includes('closed without opened')
    ) {
      event.preventDefault(); // Swallow unhandled websocket disconnect promises
      console.warn('[Vite WebSocket Rejection Suppressed]', reasonStr);
    }
  });

  window.addEventListener('error', (event) => {
    const errorStr = event.message || '';
    if (
      errorStr.includes('WebSocket') || 
      errorStr.includes('[vite]') || 
      errorStr.includes('websocket')
    ) {
      event.preventDefault(); // Avoid showing any developer overlays or crashes
      console.warn('[Vite WebSocket Exception Suppressed]', errorStr);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
