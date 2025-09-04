import React from 'react';
import ReactDOM from 'react-dom/client';
import VoiceAssistantWidget from '../components/voice-assistant-widget';
import './styles.css';

const widgetContainer = document.createElement('div');
widgetContainer.id = 'arash-ai-widget-container';
document.body.appendChild(widgetContainer);

const shadowRoot = widgetContainer.attachShadow({ mode: 'open' });

const appRoot = document.createElement('div');
shadowRoot.appendChild(appRoot);

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
  /* Include Tailwind's base, components, and utilities */
`;
shadowRoot.appendChild(styleSheet);

ReactDOM.createRoot(appRoot).render(
  <React.StrictMode>
    <VoiceAssistantWidget />
  </React.StrictMode>
);
