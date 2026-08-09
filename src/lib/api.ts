import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://linksports-backend.vercel.app/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach the access token.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh on 401 (token-based, like the main app). Only clear the session on a
// genuine 401/403 — transient failures keep the user signed in.
let isRefreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];
const flush = (err: unknown, token: string | null = null) => {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  queue = [];
};

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean });
    if (error.response?.status === 401 && !original._retry) {
      const hasToken = typeof window !== 'undefined' &&
        (!!localStorage.getItem('accessToken') || !!localStorage.getItem('refreshToken'));
      if (!hasToken) return Promise.reject(error);

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => queue.push({ resolve, reject }))
          .then((token) => { if (original.headers) original.headers.Authorization = `Bearer ${token}`; return api(original); });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        const res = await axios.post(`${API_URL}/auth/refresh`, refreshToken ? { refreshToken } : {}, { withCredentials: true });
        const { accessToken, refreshToken: rotated } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        if (rotated) localStorage.setItem('refreshToken', rotated);
        if (original.headers) original.headers.Authorization = `Bearer ${accessToken}`;
        flush(null, accessToken);
        return api(original);
      } catch (e) {
        flush(e, null);
        const status = (e as AxiosError)?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('admin:session-expired'));
        }
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  createUser: (data: Record<string, unknown>) => api.post('/admin/users', data),
  updateUser: (id: string, data: Record<string, unknown>) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  suspendUser: (id: string) => api.patch(`/admin/users/${id}/suspend`),
  getProfiles: (params: Record<string, unknown>) => api.get('/admin/profiles', { params }),
  getVotes: (params?: Record<string, unknown>) => api.get('/admin/votes', { params }),
  getPendingOrganizations: () => api.get('/admin/organizations/pending'),
  verifyOrganization: (id: string, action: string, reason?: string) => api.patch(`/admin/organizations/${id}/verify`, { action, reason }),
  getPendingListings: () => api.get('/admin/listings/pending'),
  reviewListing: (id: string, action: string, reason?: string) => api.patch(`/admin/listings/${id}/review`, { action, reason }),
  getRevenue: () => api.get('/admin/revenue'),
  sendAnnouncement: (data: Record<string, unknown>) => api.post('/admin/announcements', data),
};

export default api;
