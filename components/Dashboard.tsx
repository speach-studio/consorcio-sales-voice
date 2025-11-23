import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Lead } from '../types';
import { TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
}

export const Dashboard: React.FC<DashboardProps> = ({ leads }) => {
  const stats = {
    totalLeads: leads.length,
    activeCalls: 3,
    meetingsScheduled: leads.filter(l => l.status === 'Meeting Scheduled').length,
    conversionRate: 12.5, // Mock
  };

  const chartData = [
    { name: 'Mon', calls: 45, qualified: 12 },
    { name: 'Tue', calls: 52, qualified: 15 },
    { name: 'Wed', calls: 38, qualified: 8 },
    { name: 'Thu', calls: 65, qualified: 22 },
    { name: 'Fri', calls: 48, qualified: 14 },
  ];

  const leadStatusData = [
    { name: 'New', count: leads.filter(l => l.status === 'New Lead').length },
    { name: 'Qualified', count: leads.filter(l => l.status === 'Qualified').length },
    { name: 'Meeting', count: leads.filter(l => l.status === 'Meeting Scheduled').length },
    { name: 'Proposal', count: leads.filter(l => l.status === 'Proposal Sent').length },
    { name: 'Closed', count: leads.filter(l => l.status === 'Closed Won').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'text-blue-500' },
          { label: 'Active Calls Today', value: '142', icon: TrendingUp, color: 'text-green-500' },
          { label: 'Avg Call Duration', value: '4m 12s', icon: Clock, color: 'text-orange-500' },
          { label: 'Projected Value', value: 'R$ 1.2M', icon: DollarSign, color: 'text-purple-500' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-white mt-2">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg bg-slate-800 ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Call Volume vs Qualification</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                />
                <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="qualified" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Pipeline Status</h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="name" type="category" width={100} stroke="#64748b" />
                <RechartsTooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};