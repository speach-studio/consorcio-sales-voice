import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LiveCallSimulator } from './components/LiveCallSimulator';
import { LeadsView } from './components/LeadsView';
import { ScriptEditor } from './components/ScriptEditor';
import { View, ScriptConfig } from './types';
import { MOCK_LEADS } from './services/mockData';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [scriptConfig, setScriptConfig] = useState<ScriptConfig>({
    basePersona: `You are "Julia", a top-tier sales representative for "Consórcio Futuro".
    
Your goals:
1. Qualify the lead (ask about budget, goals: car or house).
2. Explain the benefits of consortium (no high interest rates, planned purchase).
3. Schedule a meeting with a senior consultant.

Behavior:
- Be professional, warm, and persuasive.
- Speak Portuguese or English depending on the user.
- Keep responses concise and conversational.`,
    rules: [
      {
        id: '1',
        condition: 'User mentions "waiting time" or "demora"',
        instruction: 'Explain the "lance" (bid) system as a way to speed up the process. Do not be defensive, be helpful.'
      },
      {
        id: '2',
        condition: 'User says "Not interested" or "Não tenho interesse"',
        instruction: 'Politely ask if it is due to budget or timing. If they insist, thank them and end the call gracefully.'
      }
    ]
  });

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
            <LiveCallSimulator scriptConfig={scriptConfig} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
               <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="font-semibold text-white mb-2">Simulation Scenario</h3>
                  <p className="text-sm text-slate-400">Current script is optimized for: <span className="text-blue-400 font-medium">"Consórcio Futuro" Standard</span></p>
                  <p className="text-xs text-slate-500 mt-2">Edit the script in the "Script Builder" tab to change persona or handling rules.</p>
               </div>
               <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="font-semibold text-white mb-2">Technical Info</h3>
                  <p className="text-sm text-slate-400">
                    Model: <span className="text-blue-400">gemini-2.5-flash-native-audio</span><br/>
                    Latency: <span className="text-green-400">~400ms</span><br/>
                    Active Rules: <span className="text-purple-400">{scriptConfig.rules.length} branching logic nodes</span>
                  </p>
               </div>
            </div>
          </div>
        );
      case View.SCRIPTS:
        return (
          <div className="h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-3xl font-bold text-white">Script Builder</h1>
              <p className="text-slate-400">Design conversational flows and dynamic AI responses.</p>
            </div>
            <div className="flex-1 min-h-0">
               <ScriptEditor 
                 scriptConfig={scriptConfig} 
                 setScriptConfig={setScriptConfig}
                 onTestScript={() => setCurrentView(View.SIMULATOR)} 
               />
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
      <main className="flex-1 overflow-hidden">
        <div className="p-8 h-full w-full max-w-7xl mx-auto flex flex-col">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;