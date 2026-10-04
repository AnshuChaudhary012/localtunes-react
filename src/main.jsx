import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext.jsx';
import { LibraryProvider } from './context/LibraryContext.jsx';
import './styles/style.css';
import { App } from './App.jsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <PlayerProvider>
          <LibraryProvider>
            <App />
          </LibraryProvider>
        </PlayerProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error('Fatal: #root element not found in DOM');
}
