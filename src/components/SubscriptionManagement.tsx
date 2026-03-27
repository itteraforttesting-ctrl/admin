import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Repeat, 
  DollarSign, 
  Users, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  MoreVertical,
  ArrowUpRight,
  Clock,
  Zap,
  X
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Subscription } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'subscriptions'), orderBy('renewalDate'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
      setSubscriptions(subList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'subscriptions');
    });

    return () => unsubscribe();
  }, []);

  const totalMonthlyCost = subscriptions.reduce((acc, curr) => {
    return acc + (curr.billingCycle === 'monthly' ? curr.cost : curr.cost / 12);
  }, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SaaS & Licenses</h1>
          <p className="text-muted mt-1">Track subscriptions, seat utilization, and renewal cycles.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 text-xs font-bold">
            <Zap size={16} />
            <span>Optimization Ready</span>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold orange-glow hover:bg-primary/80 transition-all"
          >
            <Plus size={20} />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Monthly SaaS Burn</p>
          <h3 className="text-3xl font-bold text-white">{formatCurrency(totalMonthlyCost)}</h3>
          <div className="mt-4 flex items-center gap-2 text-muted text-xs">
            <Clock size={14} />
            <span>Next major renewal in 12 days</span>
          </div>
        </div>
        <div className="glass-card p-6">
          <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Active Seats</p>
          <h3 className="text-3xl font-bold text-white">482 / 550</h3>
          <div className="mt-4 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[87%]" />
          </div>
        </div>
        <div className="glass-card p-6">
          <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Potential Savings</p>
          <h3 className="text-3xl font-bold text-green-400">{formatCurrency(1240)}</h3>
          <p className="text-[10px] text-muted mt-1 uppercase tracking-wider font-bold">Unused seat optimization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="glass-card h-40 animate-pulse"></div>)
        ) : (
          <AnimatePresence mode="popLayout">
            {subscriptions.map((sub) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                key={sub.id}
                className="glass-card p-6 group orange-glow-hover relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                      <Repeat size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{sub.name}</h3>
                      <p className="text-xs text-muted mt-1 uppercase tracking-wider font-bold">{sub.vendor}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                    sub.status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                    "bg-red-500/10 text-red-400 border-red-500/20"
                  )}>
                    {sub.status}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">Cost</label>
                    <p className="text-sm font-bold text-white">{formatCurrency(sub.cost)} <span className="text-[10px] text-muted font-normal">/{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}</span></p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">Renewal</label>
                    <p className="text-sm font-bold text-white">{new Date(sub.renewalDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">Utilization</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{Math.round((sub.seatsUsed / sub.seats) * 100)}%</p>
                      <span className="text-[10px] text-muted">({sub.seatsUsed}/{sub.seats})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all">
                    Manage Seats
                  </button>
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all">
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card w-full max-w-2xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Add Subscription</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-lg text-muted">
                <X size={24} />
              </button>
            </div>
            <SubscriptionForm onClose={() => setIsAdding(false)} />
          </motion.div>
        </div>
      )}
    </div>
  );
}

function SubscriptionForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    vendor: '',
    cost: 0,
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    renewalDate: new Date().toISOString().split('T')[0],
    seats: 1,
    seatsUsed: 0,
    status: 'active' as 'active' | 'cancelled' | 'expired',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'subscriptions'), {
        ...formData,
        cost: Number(formData.cost),
        seats: Number(formData.seats),
        seatsUsed: Number(formData.seatsUsed),
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'subscriptions');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Service Name</label>
          <input 
            required
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            placeholder="e.g. Slack Enterprise"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Vendor</label>
          <input 
            required
            type="text" 
            value={formData.vendor}
            onChange={(e) => setFormData({...formData, vendor: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            placeholder="e.g. Salesforce"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Cost</label>
          <input 
            required
            type="number" 
            value={formData.cost}
            onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Billing Cycle</label>
          <select 
            value={formData.billingCycle}
            onChange={(e) => setFormData({...formData, billingCycle: e.target.value as any})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Total Seats</label>
          <input 
            required
            type="number" 
            value={formData.seats}
            onChange={(e) => setFormData({...formData, seats: Number(e.target.value)})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Renewal Date</label>
          <input 
            required
            type="date" 
            value={formData.renewalDate}
            onChange={(e) => setFormData({...formData, renewalDate: e.target.value})}
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
          Save Subscription
        </button>
      </div>
    </form>
  );
}
