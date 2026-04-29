import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Inject token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('dataserv-auth');
    if (raw) {
      try {
        const state = JSON.parse(raw);
        const token = state?.state?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch {}
    }
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('dataserv-auth');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  profile: () => api.get('/auth/profile').then((r) => r.data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  manager: () => api.get('/dashboard/manager').then((r) => r.data),
  technicien: () => api.get('/dashboard/technicien').then((r) => r.data),
  client: () => api.get('/dashboard/client').then((r) => r.data),
};

// ── Tickets ───────────────────────────────────────────────────────────────────
export const ticketsApi = {
  list: (params?: Record<string, string>) =>
    api.get('/tickets', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/tickets/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/tickets', data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/tickets/${id}`, data).then((r) => r.data),
  assign: (id: string, technicienId: string) =>
    api.patch(`/tickets/${id}/assign`, { technicienId }).then((r) => r.data),
  delete: (id: string) => api.delete(`/tickets/${id}`).then((r) => r.data),
};

// ── Clients ───────────────────────────────────────────────────────────────────
export const clientsApi = {
  list: () => api.get('/clients').then((r) => r.data),
  get: (id: string) => api.get(`/clients/${id}`).then((r) => r.data),
  stats: (id: string) => api.get(`/clients/${id}/stats`).then((r) => r.data),
  me: () => api.get('/clients/me').then((r) => r.data),
  create: (data: any) => api.post('/clients', data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/clients/${id}`, data).then((r) => r.data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (role?: string) => api.get('/users', { params: role ? { role } : {} }).then((r) => r.data),
  techniciens: () => api.get('/users/techniciens').then((r) => r.data),
  get: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/users', data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
};

// ── Interventions ─────────────────────────────────────────────────────────────
export const interventionsApi = {
  get: (ticketId: string) => api.get(`/interventions/${ticketId}`).then((r) => r.data),
  update: (ticketId: string, data: any) =>
    api.patch(`/interventions/${ticketId}`, data).then((r) => r.data),
  close: (ticketId: string, data: any) =>
    api.post(`/interventions/${ticketId}/close`, data).then((r) => r.data),
};

// ── Rapports ──────────────────────────────────────────────────────────────────
export const rapportsApi = {
  exportExcel: (params?: { from?: string; to?: string; clientId?: string }) =>
    api.get('/rapports/export/excel', { params, responseType: 'blob' }).then((r) => r.data),
  mensuel: (clientId: string, month: number, year: number) =>
    api
      .get(`/rapports/mensuel/${clientId}`, { params: { month, year }, responseType: 'blob' })
      .then((r) => r.data),
};