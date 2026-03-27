export type UserRole = 'admin' | 'manager' | 'technician' | 'viewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  department: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'hardware' | 'software';
  category: string;
  serialNumber: string;
  status: 'active' | 'maintenance' | 'retired' | 'lost';
  assignedTo?: string;
  assignedToName?: string;
  warrantyExpiry?: string;
  purchaseDate?: string;
  purchasePrice: number;
  qrCode?: string;
  notes?: string;
}

export interface BudgetEntry {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  department: string;
  date: string;
  invoiceUrl?: string;
  status: 'pending' | 'approved' | 'paid';
}

export interface Subscription {
  id: string;
  name: string;
  vendor: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly';
  renewalDate: string;
  seats: number;
  seatsUsed: number;
  status: 'active' | 'cancelled' | 'expired';
}

export interface CloudResource {
  id: string;
  provider: 'aws' | 'azure' | 'gcp';
  name: string;
  type: string;
  region: string;
  status: string;
  costMonthly: number;
}

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  encryptedPassword: string;
  url?: string;
  category: string;
  teamId?: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  requesterId: string;
  requesterName: string;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  tags: string[];
  updatedAt: string;
}
