import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.scss';
import './styles/_reset.scss';
import { BrowserRouter } from 'react-router-dom';

// Mount the React app
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Register Service Worker only in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')   // Vite PWA plugin will generate /sw.js
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  });
}
