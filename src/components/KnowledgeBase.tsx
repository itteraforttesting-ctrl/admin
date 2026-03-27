import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Tag, 
  Clock, 
  User, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  X,
  FileText,
  Hash,
  Eye,
  Code
} from 'lucide-react';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Note } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';

export function KnowledgeBase() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const noteList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      setNotes(noteList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
    });

    return () => unsubscribe();
  }, []);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 animate-in fade-in duration-500">
      <div className="w-80 shrink-0 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <h1 className="text-2xl font-bold text-white tracking-tight">Wiki</h1>
          <button 
            onClick={() => setIsAdding(true)}
            className="p-2 bg-primary text-white rounded-xl orange-glow hover:bg-primary/80 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="relative group shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search wiki..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {loading ? (
            [1, 2, 3, 4, 5].map(i => <div key={i} className="glass-card h-16 animate-pulse"></div>)
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={cn(
                  "w-full text-left p-4 rounded-xl transition-all border group",
                  selectedNote?.id === note.id 
                    ? "bg-primary/10 border-primary text-white" 
                    : "bg-white/5 border-transparent text-muted hover:bg-white/10 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 mb-1">
                  <FileText size={16} className={cn(selectedNote?.id === note.id ? "text-primary" : "text-muted group-hover:text-primary")} />
                  <span className="text-sm font-bold truncate">{note.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] opacity-60">
                  <Clock size={10} />
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col glass-card overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedNote ? (
            <motion.div 
              key={selectedNote.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-border flex items-center justify-between bg-white/5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {selectedNote.category}
                    </span>
                    <div className="flex gap-2">
                      {selectedNote.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-muted border border-border px-1.5 py-0.5 rounded">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white">{selectedNote.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 hover:bg-white/10 rounded-xl text-muted hover:text-white transition-all">
                    <Edit2 size={20} />
                  </button>
                  <button className="p-2.5 hover:bg-red-500/10 rounded-xl text-muted hover:text-red-400 transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                <BookOpen className="text-muted" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white">Knowledge Base</h3>
              <p className="text-muted max-w-sm mt-2">Select a note from the sidebar to view its content or create a new one to start documenting.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card w-full max-w-4xl p-8 h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-8 shrink-0">
              <h2 className="text-2xl font-bold text-white">Create Wiki Note</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-lg text-muted">
                <X size={24} />
              </button>
            </div>
            <NoteForm onClose={() => setIsAdding(false)} />
          </motion.div>
        </div>
      )}
    </div>
  );
}

function NoteForm({ onClose }: { onClose: () => void }) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Documentation',
    tags: '',
  });
  const [preview, setPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'notes'), {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        authorId: profile?.uid,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notes');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="grid grid-cols-2 gap-6 shrink-0">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Title</label>
          <input 
            required
            type="text" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            placeholder="e.g. Server Maintenance Guide"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Category</label>
          <select 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="Documentation">Documentation</option>
            <option value="Guides">Guides</option>
            <option value="Policies">Policies</option>
            <option value="Troubleshooting">Troubleshooting</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Content (Markdown)</label>
          <button 
            type="button"
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
          >
            {preview ? <Code size={14} /> : <Eye size={14} />}
            {preview ? 'Edit Mode' : 'Preview Mode'}
          </button>
        </div>
        
        <div className="flex-1 border border-border rounded-xl overflow-hidden bg-white/5">
          {preview ? (
            <div className="h-full p-6 overflow-y-auto prose prose-invert max-w-none custom-scrollbar">
              <ReactMarkdown>{formData.content || '*No content to preview*'}</ReactMarkdown>
            </div>
          ) : (
            <textarea 
              required
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full h-full bg-transparent p-6 text-sm focus:outline-none font-mono resize-none custom-scrollbar"
              placeholder="# Use Markdown here..."
            />
          )}
        </div>
      </div>

      <div className="space-y-2 shrink-0">
        <label className="text-xs font-bold uppercase tracking-wider text-muted">Tags (comma separated)</label>
        <input 
          type="text" 
          value={formData.tags}
          onChange={(e) => setFormData({...formData, tags: e.target.value})}
          className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          placeholder="server, maintenance, linux"
        />
      </div>

      <div className="flex gap-4 pt-4 shrink-0">
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
          Save Note
        </button>
      </div>
    </form>
  );
}
