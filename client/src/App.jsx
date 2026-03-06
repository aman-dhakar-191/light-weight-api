import { useState } from 'react';
import ApiExplorer from './pages/ApiExplorer';
import DataBrowser from './pages/DataBrowser';
import About from './pages/About';
import './App.css';

const TABS = [
  { id: 'explorer', label: '⚡ API Explorer' },
  { id: 'browser',  label: '📋 Data Browser' },
  { id: 'about',    label: 'ℹ️ About' },
];

function App() {
  const [tab, setTab] = useState('explorer');

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="header-brand-icon">⚡</span>
          <span className="header-brand-name">Light-Weight API</span>
        </div>
        <div className="header-badge">
          <span className="header-badge-dot" />
          AlmostNode · Node.js in browser
        </div>
      </header>

      <nav className="app-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`app-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'explorer' && <ApiExplorer />}
        {tab === 'browser'  && <DataBrowser />}
        {tab === 'about'    && <About />}
      </main>
    </div>
  );
}

export default App;

