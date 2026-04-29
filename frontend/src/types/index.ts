export type Role = 'MANAGER' | 'TECHNICIEN' | 'CLIENT';
export type TicketStatus = 'NOUVEAU' | 'EN_COURS' | 'RESOLU' | 'CLOTURE';
export type InterventionType = 'DISTANCE' | 'SUR_SITE';
export type Priority = 'NORMAL' | 'URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  client?: Client;
}

export interface Client {
  id: string;
  userId: string;
  companyName: string;
  address?: string;
  isContractual: boolean;
  contractHours?: number;
  usedHours: number;
  travelTimeMinutes: number;
  createdAt: string;
  user?: User;
  tickets?: Ticket[];
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  type: InterventionType;
  priority: Priority;
  clientId: string;
  technicienId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  technicien?: User;
  createdBy?: User;
  intervention?: Intervention;
}

export interface Intervention {
  id: string;
  ticketId: string;
  description: string;
  resolution?: string;
  hoursWorked: number;
  travelMinutes: number;
  pdfUrl?: string;
  sentToClient: boolean;
  startedAt?: string;
  closedAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalTickets: number;
  nouveaux: number;
  enCours: number;
  resolus: number;
  clotures: number;
  urgents: number;
  todayTickets: number;
  weekTickets: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}