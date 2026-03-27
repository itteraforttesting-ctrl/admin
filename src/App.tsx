import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { AssetManagement } from './components/AssetManagement';
import { Helpdesk } from './components/Helpdesk';
import { BudgetLedger } from './components/BudgetLedger';
import { CloudManagement } from './components/CloudManagement';
import { KnowledgeBase } from './components/KnowledgeBase';
import { PasswordVault } from './components/PasswordVault';
import { SubscriptionManagement } from './components/SubscriptionManagement';
import { UserManagement } from './components/UserManagement';
import { ShieldCheck, LogIn, Activity, Lock, Zap } from 'lucide-react';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const { user, loading, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin orange-glow"></div>
          <p className="text-muted font-bold uppercase tracking-widest text-xs">Initializing ITForge...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md w-full p-10 text-center relative z-10"
        >
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8 orange-glow">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">ITForge</h1>
          <p className="text-muted mb-10">The Ultimate IT Operations Command Center for Corporations.</p>
          
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3 text-left bg-white/5 p-4 rounded-xl border border-border">
              <Activity className="text-primary" size={20} />
              <div>
                <p className="text-sm font-bold text-white">Real-time Monitoring</p>
                <p className="text-xs text-muted">Track assets and cloud costs live.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left bg-white/5 p-4 rounded-xl border border-border">
              <Lock className="text-primary" size={20} />
              <div>
                <p className="text-sm font-bold text-white">Enterprise Security</p>
                <p className="text-xs text-muted">AES-256 encrypted password vault.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
          >
            <LogIn size={20} />
            Sign in with Corporate Google Account
          </button>
          
          <p className="mt-8 text-[10px] text-muted uppercase tracking-widest font-bold">
            Secure Enterprise Access Only
          </p>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'assets': return <AssetManagement />;
      case 'tickets': return <Helpdesk />;
      case 'budget': return <BudgetLedger />;
      case 'cloud': return <CloudManagement />;
      case 'notes': return <KnowledgeBase />;
      case 'vault': return <PasswordVault />;
      case 'subscriptions': return <SubscriptionManagement />;
      case 'users': return <UserManagement />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-white overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toaster position="top-right" theme="dark" richColors />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
