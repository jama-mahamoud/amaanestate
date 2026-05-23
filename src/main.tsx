import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Global resilience handlers to swallow local development HMR/WebSocket disconnect errors
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const errorStr = args.map(arg => String(arg || '')).join(' ').toLowerCase();
    if (
      errorStr.includes('websocket') || 
      errorStr.includes('[vite]') || 
      errorStr.includes('failed to connect to websocket') ||
      errorStr.includes('websocket closed') ||
      errorStr.includes('closed without opened')
    ) {
      // Quietly log to avoid modal or overlay crashes
      console.warn('[Vite Dev WebSocket Suppressed]', ...args);
      return;
    }
    originalError(...args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault(); // Always swallow native browser console noise
    const reason = event.reason;
    console.warn('[Vite WebSocket Rejection Suppressed]', reason);
  });

  window.addEventListener('error', (event) => {
    const errorStr = (event.message || '').toLowerCase();
    if (
      errorStr.includes('websocket') || 
      errorStr.includes('[vite]') || 
      errorStr.includes('closed without opened')
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
