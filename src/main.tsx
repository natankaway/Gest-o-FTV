import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Apply custom scrollbar styles
const createScrollbarStyles = () => {
  if (typeof document !== 'undefined') {
    const existingStyle = document.getElementById('custom-scrollbars');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const cssStyles = `
      /* Custom Scrollbars */
      ::-webkit-scrollbar {
        width: 6px;
      }
      
      /* Light mode */
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.08);
        border-radius: 3px;
        margin: 8px 0;
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.4);
        border-radius: 3px;
        transition: all 0.2s ease;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.6);
      }
      
      /* Dark mode */
      .dark ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.08);
      }
      
      .dark ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.25);
      }
      
      .dark ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.4);
      }
      
      /* Firefox */
      html:not(.dark) * {
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.08);
      }
      
      .dark * {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.25) rgba(255, 255, 255, 0.08);
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.id = "custom-scrollbars";
    styleElement.textContent = cssStyles;
    document.head.appendChild(styleElement);
  }
};

if (typeof window !== 'undefined') {
  createScrollbarStyles();
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);