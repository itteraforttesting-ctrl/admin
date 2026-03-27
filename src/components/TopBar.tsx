import React from 'react';
import { Search, Bell, HelpCircle, Command } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function TopBar() {
  const { profile } = useAuth();

  return (
    <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search assets, tickets, or documentation... (Cmd + K)"
            className="w-full bg-white/5 border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded border border-border text-[10px] text-muted font-mono">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-8">
        <button className="p-2.5 hover:bg-white/5 rounded-xl text-muted hover:text-white transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
        </button>
        <button className="p-2.5 hover:bg-white/5 rounded-xl text-muted hover:text-white transition-all">
          <HelpCircle size={20} />
        </button>
        <div className="h-8 w-[1px] bg-border mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{profile?.displayName}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider font-bold">{profile?.department}</p>
          </div>
          <img 
            src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName}&background=DC5C01&color=fff`} 
            alt="Avatar" 
            className="w-10 h-10 rounded-xl border border-border orange-glow-hover cursor-pointer"
          />
        </div>
      </div>
    </header>
  );
}
