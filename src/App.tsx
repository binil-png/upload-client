import React from 'react';
import { Dashboard } from './components/Dashboard';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">Sync Orchestrator</h1>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
