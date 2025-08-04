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

      /* Tactical Board Responsive Layout */
      .treino-editor-container {
        min-height: 100vh;
        background: #f8f9fa;
      }
      
      /* Mobile-first: Stack layout */
      .treino-editor-main {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      
      .formulario-sidebar {
        width: 100%;
        background: #f8f9fa;
        padding: 1rem;
        border-bottom: 1px solid #e9ecef;
      }
      
      .formulario-content {
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .prancheta-container {
        flex: 1;
        background: #ffffff;
        padding: 1rem;
        min-height: 80vh;
      }
      
      .prancheta-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 1rem;
      }
      
      .prancheta-toolbar {
        flex-shrink: 0;
      }
      
      .prancheta-canvas-container {
        flex: 1;
        background: #ffffff;
        border: 2px solid #28a745;
        border-radius: 8px;
        padding: 1rem;
        overflow: auto;
        min-height: 60vh;
      }
      
      .prancheta-canvas-wrapper {
        width: 100%;
        height: 100%;
        min-height: 60vh;
        position: relative;
        overflow: hidden;
        border-radius: 4px;
      }
      
      /* Desktop: Horizontal layout */
      @media (min-width: 1024px) {
        .treino-editor-main {
          flex-direction: row;
          height: 100vh;
          overflow: hidden;
        }
        
        .formulario-sidebar {
          width: 400px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          border-right: 1px solid #e9ecef;
          border-bottom: none;
          padding: 1.5rem;
        }
        
        .formulario-content {
          max-height: none;
          height: 100%;
        }
        
        .prancheta-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          min-height: 120vh; /* Force vertical scroll */
        }
        
        .prancheta-canvas-container {
          min-height: 120vh; /* Force scroll and maintain aspect ratio */
          height: auto;
        }
        
        .prancheta-canvas-wrapper {
          width: 100%;
          aspect-ratio: 1 / 2; /* Futevolei proportion */
          min-height: 120vh;
          max-width: 100%;
        }
      }
      
      /* Large desktop optimizations */
      @media (min-width: 1440px) {
        .prancheta-canvas-wrapper {
          max-width: 90%;
          margin: 0 auto;
        }
      }
      
      /* Dark mode styles */
      .dark .treino-editor-container {
        background: #1f2937;
      }
      
      .dark .formulario-sidebar {
        background: #1f2937;
        border-color: #374151;
      }
      
      .dark .prancheta-container {
        background: #111827;
      }
      
      .dark .prancheta-canvas-container {
        background: #1f2937;
        border-color: #10b981;
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