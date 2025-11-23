import React from 'react';
import { View } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  Calendar, 
  FileText, 
  Settings,
  Activity
} from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.SIMULATOR, label: 'Voice Simulator', icon: Activity },
    { id: View.LEADS, label: 'Leads', icon: Users },
    { id: View.SCHEDULER, label: 'Scheduler', icon: Calendar },
    { id: View.PROPOSALS, label: 'Proposals', icon: FileText },
    { id: View.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <PhoneCall className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ConsorcioAI</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">Voice Sales Automation</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={18} />
              {item.label}
              {item.id === View.SIMULATOR && (
                <span className="ml-auto flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              AM
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Admin Manager</p>
              <p className="text-xs text-slate-500 truncate">admin@consorcio.ai</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};