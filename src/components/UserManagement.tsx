import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Shield, 
  UserCheck, 
  UserX, 
  MoreVertical, 
  Mail, 
  Briefcase, 
  Calendar,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-500/10 text-red-400 border-red-500/20',
  manager: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  technician: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  viewer: 'bg-muted/10 text-muted border-muted/20',
};

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { profile: currentUserProfile } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('displayName'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
      setUsers(userList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateRole = async (uid: string, role: UserRole) => {
    if (currentUserProfile?.role !== 'admin') {
      alert('Only admins can change user roles.');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Team & Access</h1>
          <p className="text-muted mt-1">Manage user roles, departments, and system permissions.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white/5 text-muted px-4 py-2 rounded-xl border border-border text-xs font-bold">
            <Shield size={16} />
            <span>RBAC Enabled</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search users by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">User</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">Department</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted">Joined</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 bg-white/5"></td>
                  </tr>
                ))
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=DC5C01&color=fff`} 
                          alt={user.displayName} 
                          className="w-10 h-10 rounded-xl border border-border"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">{user.displayName}</p>
                          <p className="text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.role}
                        disabled={currentUserProfile?.role !== 'admin'}
                        onChange={(e) => handleUpdateRole(user.uid, e.target.value as UserRole)}
                        className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border bg-transparent focus:outline-none",
                          roleColors[user.role]
                        )}
                      >
                        <option value="admin" className="bg-card text-white">Admin</option>
                        <option value="manager" className="bg-card text-white">Manager</option>
                        <option value="technician" className="bg-card text-white">Technician</option>
                        <option value="viewer" className="bg-card text-white">Viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-white">
                        <Briefcase size={14} className="text-muted" />
                        {user.department}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <Calendar size={14} />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-muted transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
