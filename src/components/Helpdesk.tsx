import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Ticket, 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical,
  ChevronRight,
  Send,
  Paperclip,
  X,
  UserPlus
} from 'lucide-react';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { Ticket as TicketType } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const priorityColors = {
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  medium: 'bg-green-500/10 text-green-400 border-green-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusColors = {
  open: 'bg-white/5 text-white border-white/10',
  'in-progress': 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-muted/10 text-muted border-muted/20',
};

export function Helpdesk() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TicketType));
      setTickets(ticketList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tickets');
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: TicketType['status']) => {
    try {
      await updateDoc(doc(db, 'tickets', id), { 
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tickets/${id}`);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-end justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Helpdesk</h1>
            <p className="text-muted mt-1">Manage support requests and technical issues.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold orange-glow hover:bg-primary/80 transition-all"
          >
            <Plus size={20} />
            <span>New Ticket</span>
          </button>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-border shrink-0">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search tickets by subject or ID..."
              className="w-full bg-transparent border-none py-1 pl-12 pr-4 text-sm focus:outline-none transition-all"
            />
          </div>
          <div className="h-6 w-[1px] bg-border"></div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Filter:</span>
            <select className="bg-transparent text-xs font-bold text-white focus:outline-none">
              <option>All Tickets</option>
              <option>My Tickets</option>
              <option>Unassigned</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="glass-card h-24 animate-pulse"></div>)
          ) : (
            tickets.map((ticket) => (
              <motion.div
                layout
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={cn(
                  "glass-card p-5 cursor-pointer transition-all border-l-4 group",
                  selectedTicket?.id === ticket.id ? "bg-white/10 border-primary" : "hover:bg-white/5 border-transparent",
                  ticket.priority === 'critical' && "border-l-red-500",
                  ticket.priority === 'high' && "border-l-orange-500",
                  ticket.priority === 'medium' && "border-l-green-500",
                  ticket.priority === 'low' && "border-l-blue-500"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", priorityColors[ticket.priority])}>
                      {ticket.priority}
                    </div>
                    <span className="text-xs text-muted font-mono">#IT-{ticket.id.slice(0, 6).toUpperCase()}</span>
                  </div>
                  <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", statusColors[ticket.status])}>
                    {ticket.status}
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-4 group-hover:text-primary transition-colors">{ticket.subject}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <User size={14} />
                      <span>{ticket.requesterName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Clock size={14} />
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {ticket.assigneeId ? (
                      <img 
                        src={`https://ui-avatars.com/api/?name=${ticket.assigneeName}&background=DC5C01&color=fff`} 
                        className="w-6 h-6 rounded-full border-2 border-card"
                        title={ticket.assigneeName}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-card flex items-center justify-center text-[10px] text-muted">
                        ?
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="w-96 shrink-0 flex flex-col gap-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedTicket ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card flex-1 flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-white">Ticket Details</h3>
                <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-white/5 rounded text-muted">
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">Subject</label>
                  <p className="text-white font-bold text-xl">{selectedTicket.subject}</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">Description</label>
                  <div className="bg-white/5 p-4 rounded-xl text-sm text-muted leading-relaxed">
                    {selectedTicket.description}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">Status</label>
                    <select 
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value as any)}
                      className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">Assignee</label>
                    <button className="w-full flex items-center justify-between bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-muted hover:text-white transition-all">
                      <span>{selectedTicket.assigneeName || 'Assign to me'}</span>
                      <UserPlus size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted block">Activity</label>
                  <div className="space-y-4">
                    {[
                      { user: 'System', text: 'Ticket created', time: '2h ago' },
                      { user: 'Sarah Chen', text: 'Changed status to In Progress', time: '1h ago' },
                    ].map((msg, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <User size={14} className="text-muted" />
                        </div>
                        <div>
                          <p className="text-xs text-white"><span className="font-bold">{msg.user}</span> {msg.text}</p>
                          <p className="text-[10px] text-muted mt-0.5">{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border bg-white/5">
                <div className="relative">
                  <textarea 
                    placeholder="Add a comment..."
                    className="w-full bg-background border border-border rounded-xl p-3 pr-12 text-sm focus:outline-none focus:border-primary/50 resize-none h-20"
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <button className="p-1.5 text-muted hover:text-white transition-colors">
                      <Paperclip size={18} />
                    </button>
                    <button className="p-1.5 bg-primary text-white rounded-lg orange-glow hover:bg-primary/80 transition-all">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center glass-card text-center p-8">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <Ticket className="text-muted" size={32} />
              </div>
              <h3 className="text-white font-bold">No Ticket Selected</h3>
              <p className="text-muted text-sm mt-2">Select a ticket from the list to view details and activity.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card w-full max-w-2xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Create New Ticket</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-lg text-muted">
                <X size={24} />
              </button>
            </div>
            <TicketForm onClose={() => setIsAdding(false)} />
          </motion.div>
        </div>
      )}
    </div>
  );
}

function TicketForm({ onClose }: { onClose: () => void }) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium' as TicketType['priority'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'tickets'), {
        ...formData,
        status: 'open',
        requesterId: profile?.uid,
        requesterName: profile?.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tickets');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted">Subject</label>
        <input 
          required
          type="text" 
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          placeholder="e.g. VPN connection issues"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted">Priority</label>
        <div className="grid grid-cols-4 gap-3">
          {['low', 'medium', 'high', 'critical'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFormData({...formData, priority: p as any})}
              className={cn(
                "py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                formData.priority === p 
                  ? priorityColors[p as keyof typeof priorityColors]
                  : "bg-white/5 text-muted border-border hover:border-white/20"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted">Description</label>
        <textarea 
          required
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 resize-none"
          placeholder="Describe the issue in detail..."
        />
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
          Create Ticket
        </button>
      </div>
    </form>
  );
}
