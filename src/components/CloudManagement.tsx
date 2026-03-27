import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Server, 
  Database, 
  Globe, 
  Shield, 
  Activity, 
  DollarSign, 
  Plus, 
  ExternalLink, 
  RefreshCw,
  MoreVertical,
  Cpu,
  HardDrive
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { CloudResource } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const providerColors: Record<string, string> = {
  aws: 'text-[#FF9900] bg-[#FF9900]/10 border-[#FF9900]/20',
  azure: 'text-[#0089D6] bg-[#0089D6]/10 border-[#0089D6]/20',
  gcp: 'text-[#4285F4] bg-[#4285F4]/10 border-[#4285F4]/20',
};

const providerLogos: Record<string, string> = {
  aws: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
  azure: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg',
  gcp: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg',
};

export function CloudManagement() {
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'cloud_resources'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudResource));
      setResources(resList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'cloud_resources');
    });

    return () => unsubscribe();
  }, []);

  const totalMonthlyCost = resources.reduce((acc, curr) => acc + curr.costMonthly, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Cloud Infrastructure</h1>
          <p className="text-muted mt-1">Unified view of multi-cloud resources and spending.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-white/5 text-white px-6 py-2.5 rounded-xl font-bold border border-border hover:bg-white/10 transition-all">
            <RefreshCw size={20} />
            <span>Sync All</span>
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold orange-glow hover:bg-primary/80 transition-all"
          >
            <Plus size={20} />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent">
          <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Total Monthly Spend</p>
          <h3 className="text-3xl font-bold text-white">{formatCurrency(totalMonthlyCost)}</h3>
          <div className="mt-4 flex items-center gap-2 text-green-400 text-xs font-bold">
            <Activity size={14} />
            <span>Running Smoothly</span>
          </div>
        </div>
        {['aws', 'azure', 'gcp'].map(provider => {
          const providerCost = resources.filter(r => r.provider === provider).reduce((acc, curr) => acc + curr.costMonthly, 0);
          const providerCount = resources.filter(r => r.provider === provider).length;
          return (
            <div key={provider} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <img src={providerLogos[provider]} alt={provider} className="h-6 w-auto grayscale group-hover:grayscale-0 transition-all" />
                <span className="text-xs text-muted font-bold uppercase">{providerCount} Resources</span>
              </div>
              <h3 className="text-xl font-bold text-white">{formatCurrency(providerCost)}</h3>
              <p className="text-[10px] text-muted mt-1 uppercase tracking-wider font-bold">Monthly estimated</p>
            </div>
          );
        })}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between bg-white/5">
          <h3 className="font-bold text-white">Active Resources</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted">Running</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-xs text-muted">Stopped</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">Resource</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">Provider</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">Region</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted text-right">Cost/Mo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resources.map((res) => (
                <tr key={res.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                        {res.type.toLowerCase().includes('db') ? <Database size={16} /> : 
                         res.type.toLowerCase().includes('vm') || res.type.toLowerCase().includes('ec2') ? <Server size={16} /> : 
                         <Globe size={16} />}
                      </div>
                      <span className="text-sm font-bold text-white">{res.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border", providerColors[res.provider])}>
                      {res.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted">{res.type}</td>
                  <td className="px-6 py-4 text-xs text-muted font-mono">{res.region}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", res.status === 'Running' ? "bg-green-500" : "bg-orange-500")}></div>
                      <span className="text-xs text-white">{res.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-white">
                    {formatCurrency(res.costMonthly)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <h2 className="text-2xl font-bold text-white">Add Cloud Resource</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-lg text-muted">&times;</button>
            </div>
            <CloudForm onClose={() => setIsAdding(false)} />
          </motion.div>
        </div>
      )}
    </div>
  );
}

function CloudForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    provider: 'aws' as 'aws' | 'azure' | 'gcp',
    type: 'EC2 Instance',
    region: 'us-east-1',
    status: 'Running',
    costMonthly: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'cloud_resources'), {
        ...formData,
        costMonthly: Number(formData.costMonthly),
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'cloud_resources');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2 col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Resource Name</label>
          <input 
            required
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            placeholder="e.g. production-db-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Provider</label>
          <select 
            value={formData.provider}
            onChange={(e) => setFormData({...formData, provider: e.target.value as any})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="aws">AWS</option>
            <option value="azure">Azure</option>
            <option value="gcp">GCP</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Type</label>
          <input 
            required
            type="text" 
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            placeholder="e.g. t3.medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Region</label>
          <input 
            required
            type="text" 
            value={formData.region}
            onChange={(e) => setFormData({...formData, region: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            placeholder="e.g. us-east-1"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Cost / Month ($)</label>
          <input 
            required
            type="number" 
            value={formData.costMonthly}
            onChange={(e) => setFormData({...formData, costMonthly: Number(e.target.value)})}
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
          Save Resource
        </button>
      </div>
    </form>
  );
}
