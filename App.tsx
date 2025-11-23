import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LiveCallSimulator } from './components/LiveCallSimulator';
import { LeadsView } from './components/LeadsView';
import { View } from './types';
import { MOCK_LEADS } from './services/mockData';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard leads={MOCK_LEADS} />;
      case View.SIMULATOR:
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col gap-2 mb-8">
              <h1 className="text-3xl font-bold text-white">Call Simulator</h1>
              <p className="text-slate-400">Test the AI voice agent scripts and conversation flow in real-time.</p>
            </div>
            <LiveCallSimulator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
               <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="font-semibold text-white mb-2">Simulation Scenario</h3>
                  <p className="text-sm text-slate-400">Inbound call from a lead interested in a "Carta de Crédito" for a vehicle. The AI should qualify the budget and schedule a video call.</p>
               </div>
               <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="font-semibold text-white mb-2">Technical Info</h3>
                  <p className="text-sm text-slate-400">
                    Model: <span className="text-blue-400">gemini-2.5-flash-native-audio</span><br/>
                    Latency: <span className="text-green-400">~400ms</span><br/>
                    Voice: Kore (HD)
                  </p>
               </div>
            </div>
          </div>
        );
      case View.LEADS:
        return <LeadsView leads={MOCK_LEADS} />;
      case View.SCHEDULER:
        return (
          <div className="flex items-center justify-center h-[600px] text-slate-500">
            <div className="text-center">
              <p className="text-xl font-medium mb-2">Scheduler Module</p>
              <p className="text-sm">Integration with Google Calendar API would go here.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-[600px] text-slate-500">
            <p>Module under development</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;