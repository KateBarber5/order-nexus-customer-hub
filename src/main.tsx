import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handlers to catch message port errors and other async errors
window.addEventListener('error', (event) => {
  // Check if it's a message port error
  if (event.error && event.error.message && 
      (event.error.message.includes('message port') || 
       event.error.message.includes('asynchronous response'))) {
    console.log('Message port error caught by global handler:', event.error.message);
    event.preventDefault(); // Prevent the error from being logged to console
    return;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  // Check if it's a message port error
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('message port') || 
       event.reason.message.includes('asynchronous response'))) {
    console.log('Message port promise rejection caught by global handler:', event.reason.message);
    event.preventDefault(); // Prevent the error from being logged to console
    return;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
