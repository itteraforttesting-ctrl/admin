import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Laptop, 
  Wallet, 
  Repeat, 
  Cloud, 
  Key, 
  BookOpen, 
  Ticket, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  ShieldCheck,
  Briefcase,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assets', label: 'Asset Management', icon: Laptop },
  { id: 'budget', label: 'Budget & Ledger', icon: Wallet },
  { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
  { id: 'cloud', label: 'Cloud Resources', icon: Cloud },
  { id: 'vault', label: 'Password Vault', icon: Key },
  { id: 'notes', label: 'Knowledge Base', icon: BookOpen },
  { id: 'tickets', label: 'Helpdesk', icon: Ticket },
  { id: 'users', label: 'User & Team', icon: Users },
  { id: 'vendors', label: 'Vendors', icon: Briefcase },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile, logout } = useAuth();

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      className="h-screen bg-card border-r border-border flex flex-col transition-all duration-300 relative z-50"
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center orange-glow">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ITForge</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/5 rounded-lg text-muted transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-primary text-white orange-glow" 
                : "text-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={22} className={cn(
              "shrink-0",
              activeTab === item.id ? "text-white" : "group-hover:text-primary transition-colors"
            )} />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName}&background=DC5C01&color=fff`} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border border-border"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile?.displayName}</p>
              <p className="text-xs text-muted truncate capitalize">{profile?.role}</p>
            </div>
          </div>
        )}
        <button 
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={22} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
}
