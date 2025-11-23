import React from 'react';
import { Lead, LeadStatus } from '../types';
import { Phone, Mail, MoreHorizontal, CalendarCheck, Search } from 'lucide-react';

interface LeadsViewProps {
  leads: Lead[];
}

export const LeadsView: React.FC<LeadsViewProps> = ({ leads }) => {
  const getStatusColor = (status: LeadStatus) => {
    switch(status) {
      case LeadStatus.NEW: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case LeadStatus.QUALIFIED: return 'bg-green-500/10 text-green-400 border-green-500/20';
      case LeadStatus.CLOSED_LOST: return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Lead Management</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Add New Lead
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search leads..." 
               className="w-full bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500"
             />
           </div>
           <div className="flex gap-2">
             <select className="bg-slate-800 border-none rounded-lg py-2 px-3 text-sm text-slate-300">
               <option>All Status</option>
               <option>New Lead</option>
               <option>Qualified</option>
             </select>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Interest</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Next Action</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-white">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{lead.productInterest}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${lead.score > 80 ? 'bg-green-500' : lead.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="text-xs">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{lead.nextAction}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-blue-400" title="Call">
                        <Phone size={16} />
                      </button>
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400" title="Schedule">
                        <CalendarCheck size={16} />
                      </button>
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};