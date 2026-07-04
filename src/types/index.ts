export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'customer';
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}
