import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  FileText, 
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { BudgetEntry } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const categoryColors: Record<string, string> = {
  Hardware: '#DC5C01',
  Software: '#0089D6',
  Cloud: '#FF9900',
  Services: '#4285F4',
  Other: '#3C3C3C',
};

export function BudgetLedger() {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'budgets'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entryList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BudgetEntry));
      setEntries(entryList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'budgets');
    });

    return () => unsubscribe();
  }, []);

  const totalIncome = entries.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = Object.entries(
    entries.filter(e => e.type === 'expense').reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Budget & Ledger</h1>
          <p className="text-muted mt-1">Track IT spending, invoices, and department budgets.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-white/5 text-white px-6 py-2.5 rounded-xl font-bold border border-border hover:bg-white/10 transition-all">
            <Download size={20} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold orange-glow hover:bg-primary/80 transition-all"
          >
            <Plus size={20} />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted text-sm font-medium">Total Budget</p>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{formatCurrency(totalIncome)}</h3>
          <p className="text-[10px] text-muted mt-2 uppercase tracking-wider font-bold">Allocated for FY2026</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted text-sm font-medium">Total Spend</p>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
              <TrendingDown size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{formatCurrency(totalExpense)}</h3>
          <p className="text-[10px] text-muted mt-2 uppercase tracking-wider font-bold">Actual year-to-date</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted text-sm font-medium">Remaining</p>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Wallet size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{formatCurrency(balance)}</h3>
          <p className="text-[10px] text-muted mt-2 uppercase tracking-wider font-bold">Available funds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between bg-white/5">
            <h3 className="font-bold text-white">Transaction History</h3>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={14} />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="bg-background border border-border rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">Title</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-xs text-muted font-mono">{entry.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          entry.type === 'income' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        )}>
                          {entry.type === 'income' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <span className="text-sm font-bold text-white">{entry.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded bg-white/5 border border-border text-muted uppercase tracking-wider font-bold">
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {entry.status === 'paid' ? <CheckCircle2 size={14} className="text-green-400" /> : 
                         entry.status === 'approved' ? <Clock size={14} className="text-primary" /> : 
                         <AlertCircle size={14} className="text-orange-400" />}
                        <span className={cn(
                          "text-xs font-medium capitalize",
                          entry.status === 'paid' ? "text-green-400" : 
                          entry.status === 'approved' ? "text-primary" : 
                          "text-orange-400"
                        )}>
                          {entry.status}
                        </span>
                      </div>
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-sm font-bold text-right",
                      entry.type === 'income' ? "text-green-400" : "text-white"
                    )}>
                      {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Spend by Category</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || '#3C3C3C'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #2C2C2C', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[item.name] || '#3C3C3C' }}></div>
                  <span className="text-muted">{item.name}</span>
                </div>
                <span className="text-white font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card w-full max-w-2xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Add Ledger Entry</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-lg text-muted">&times;</button>
            </div>
            <BudgetForm onClose={() => setIsAdding(false)} />
          </motion.div>
        </div>
      )}
    </div>
  );
}

function BudgetForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category: 'Hardware',
    department: 'IT',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'approved' | 'paid',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'budgets'), {
        ...formData,
        amount: Number(formData.amount),
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'budgets');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2 col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Title / Description</label>
          <input 
            required
            type="text" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            placeholder="e.g. Q1 AWS Infrastructure Bill"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Amount ($)</label>
          <input 
            required
            type="number" 
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Type</label>
          <select 
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value as any})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="expense">Expense</option>
            <option value="income">Income / Allocation</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Category</label>
          <select 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Cloud">Cloud</option>
            <option value="Services">Services</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Date</label>
          <input 
            required
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <button 
          type="button" 
          onClick={onClose}
          className="flex-1 py-3 rounded-xl bg-white/5 border border-border text-sm font-bold text-white hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold orange-glow hover:bg-primary/80 transition-all"
        >
          Save Entry
        </button>
      </div>
    </form>
  );
}
