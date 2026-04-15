import React from 'react';
import { Dashboard } from './components/Dashboard';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 py-4 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Sync Orchestrator
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">Manage and monitor database syncing.</p>
          </div>
        </header>
        <main>
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
