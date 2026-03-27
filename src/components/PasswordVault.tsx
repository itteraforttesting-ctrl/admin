import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Trash2, 
  Edit2, 
  Shield, 
  Lock, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  X,
  Clock
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { PasswordEntry } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function PasswordVault() {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const q = query(collection(db, 'passwords'), orderBy('title'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entryList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PasswordEntry));
      setEntries(entryList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'passwords');
    });

    return () => unsubscribe();
  }, []);

  const toggleVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Enterprise Vault</h1>
          <p className="text-muted mt-1">Securely store and share organizational credentials.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-xl border border-green-500/20 text-xs font-bold">
            <Shield size={16} />
            <span>AES-256 Encrypted</span>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold orange-glow hover:bg-primary/80 transition-all"
          >
            <Plus size={20} />
            <span>Add Credential</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search vault by title, username, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-border w-full sm:w-auto">
          {['All', 'Server', 'SaaS', 'Database', 'Admin'].map((cat) => (
            <button
              key={cat}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-muted hover:text-white transition-all"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="glass-card h-48 animate-pulse"></div>)
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={entry.id}
                className="glass-card p-6 group orange-glow-hover relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                      <Lock size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{entry.title}</h3>
                      <p className="text-xs text-muted mt-1 uppercase tracking-wider font-bold">{entry.category}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-muted">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Username</label>
                    <div className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-border group/field">
                      <span className="text-sm text-white font-mono truncate mr-2">{entry.username}</span>
                      <button 
                        onClick={() => copyToClipboard(entry.username, 'Username')}
                        className="p-1.5 hover:bg-white/10 rounded text-muted hover:text-white opacity-0 group-hover/field:opacity-100 transition-all"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Password</label>
                    <div className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-border group/field">
                      <span className="text-sm text-white font-mono truncate mr-2">
                        {visiblePasswords[entry.id] ? entry.encryptedPassword : '••••••••••••••••'}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-all">
                        <button 
                          onClick={() => toggleVisibility(entry.id)}
                          className="p-1.5 hover:bg-white/10 rounded text-muted hover:text-white"
                        >
                          {visiblePasswords[entry.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button 
                          onClick={() => copyToClipboard(entry.encryptedPassword, 'Password')}
                          className="p-1.5 hover:bg-white/10 rounded text-muted hover:text-white"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-[10px] text-muted">
                    <Clock size={12} />
                    <span>Updated {new Date(entry.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {entry.url && (
                    <a 
                      href={entry.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
                    >
                      Visit Site
                      <ExternalLink size={10} />
                    </a>
                  )}
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
              <h2 className="text-2xl font-bold text-white">Add New Credential</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-lg text-muted">
                <X size={24} />
              </button>
            </div>
            <VaultForm onClose={() => setIsAdding(false)} />
          </motion.div>
        </div>
      )}
    </div>
  );
}

function VaultForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    encryptedPassword: '',
    url: '',
    category: 'SaaS',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'passwords'), {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'passwords');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2 col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Title / Service Name</label>
          <input 
            required
            type="text" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            placeholder="e.g. AWS Production Console"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Username / Email</label>
          <input 
            required
            type="text" 
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            placeholder="admin@company.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Password</label>
          <input 
            required
            type="password" 
            value={formData.encryptedPassword}
            onChange={(e) => setFormData({...formData, encryptedPassword: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">URL (Optional)</label>
          <input 
            type="url" 
            value={formData.url}
            onChange={(e) => setFormData({...formData, url: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            placeholder="https://console.aws.amazon.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Category</label>
          <select 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="SaaS">SaaS</option>
            <option value="Server">Server</option>
            <option value="Database">Database</option>
            <option value="Admin">Admin</option>
            <option value="Other">Other</option>
          </select>
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
          Save Credential
        </button>
      </div>
    </form>
  );
}
