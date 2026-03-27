import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Laptop, 
  AlertCircle, 
  DollarSign,
  Activity,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Ticket,
  Key,
  FileText,
  Cloud
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { formatCurrency } from '../lib/utils';
import { motion } from 'framer-motion';

const data = [
  { name: 'Jan', cost: 4000, tickets: 240 },
  { name: 'Feb', cost: 3000, tickets: 139 },
  { name: 'Mar', cost: 2000, tickets: 980 },
  { name: 'Apr', cost: 2780, tickets: 390 },
  { name: 'May', cost: 1890, tickets: 480 },
  { name: 'Jun', cost: 2390, tickets: 380 },
  { name: 'Jul', cost: 3490, tickets: 430 },
];

const cloudCostData = [
  { name: 'AWS', value: 12400, color: '#FF9900' },
  { name: 'Azure', value: 8200, color: '#0089D6' },
  { name: 'GCP', value: 4500, color: '#4285F4' },
];

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 orange-glow-hover transition-all"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-primary/10 rounded-xl">
        <Icon className="text-primary w-6 h-6" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
        trend === 'up' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
      )}>
        {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change}
      </div>
    </div>
    <p className="text-muted text-sm font-medium mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
  </motion.div>
);

import { cn } from '../lib/utils';

export function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
          <p className="text-muted mt-1">Real-time overview of your IT infrastructure and operations.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-border">
          <button className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-primary rounded-lg orange-glow">Real-time</button>
          <button className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-white transition-colors">History</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Assets" value="1,284" change="+12%" icon={Laptop} trend="up" />
        <StatCard title="Active Tickets" value="42" change="-5%" icon={AlertCircle} trend="down" />
        <StatCard title="Monthly Burn" value={formatCurrency(48250)} change="+2.4%" icon={DollarSign} trend="up" />
        <StatCard title="Cloud Cost" value={formatCurrency(25100)} change="-8.1%" icon={Activity} trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Operational Efficiency</h3>
            <select className="bg-white/5 border border-border rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-primary/50">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC5C01" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#DC5C01" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #2C2C2C', borderRadius: '12px' }}
                  itemStyle={{ color: '#DC5C01' }}
                />
                <Area type="monotone" dataKey="cost" stroke="#DC5C01" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-8">Cloud Spend Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cloudCostData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #2C2C2C', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {cloudCostData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {cloudCostData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-muted">{item.name}</span>
                </div>
                <span className="text-white font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            <button className="text-primary text-xs font-bold uppercase tracking-wider hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {[
              { user: 'Sarah Chen', action: 'assigned a new MacBook Pro to', target: 'John Doe', time: '2 mins ago', icon: Laptop },
              { user: 'System', action: 'detected unauthorized access attempt in', target: 'Vault', time: '15 mins ago', icon: ShieldCheck },
              { user: 'Mike Ross', action: 'resolved ticket', target: '#IT-4821', time: '1 hour ago', icon: Ticket },
              { user: 'Budget Bot', action: 'flagged unusual spend in', target: 'AWS S3', time: '3 hours ago', icon: DollarSign },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <activity.icon className="text-muted group-hover:text-primary transition-colors" size={18} />
                </div>
                <div>
                  <p className="text-sm text-white">
                    <span className="font-bold">{activity.user}</span> {activity.action} <span className="text-primary font-medium">{activity.target}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={12} className="text-muted" />
                    <span className="text-xs text-muted">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'New Asset', icon: Laptop, color: 'bg-blue-500' },
              { label: 'Create Ticket', icon: Ticket, color: 'bg-orange-500' },
              { label: 'Add User', icon: Users, color: 'bg-green-500' },
              { label: 'Vault Access', icon: Key, color: 'bg-purple-500' },
              { label: 'Upload Invoice', icon: FileText, color: 'bg-pink-500' },
              { label: 'Cloud Audit', icon: Cloud, color: 'bg-cyan-500' },
            ].map((action, i) => (
              <button key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-border hover:bg-white/10 hover:border-primary/30 transition-all group text-left">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", action.color)}>
                  <action.icon size={20} />
                </div>
                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{action.label}</span>
                <ArrowUpRight size={14} className="ml-auto text-muted group-hover:text-primary transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
