import axios from "axios";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Base API (no /admin prefix) for health and public config. */
export const baseApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export const adminApi = {
  getAnalytics: () => api.get("/analytics"),

  getUsers: (params?: Record<string, unknown>) => api.get("/users", { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  createUser: (data: unknown) => api.post("/users", data),
  updateUser: (id: string, data: unknown) => api.put(`/users/${id}`, data),
  updateUserRole: (id: string, role: string) =>
    api.patch(`/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/users/${id}`),

  getDevices: (params?: Record<string, unknown>) =>
    api.get("/devices", { params }),
  getDevice: (id: string) => api.get(`/devices/${id}`),
  createDevice: (data: unknown) => api.post("/devices", data),
  updateDevice: (id: string, data: unknown) => api.put(`/devices/${id}`, data),
  deleteDevice: (id: string) => api.delete(`/devices/${id}`),
  transferDevice: (id: string, userId: string) =>
    api.patch(`/devices/${id}/transfer`, { user_id: userId }),
  controlDevice: (id: string, command: string, params: Record<string, unknown> = {}) =>
    api.post(`/devices/${id}/control`, { command, params }),
  getDeviceTelemetry: (id: string) => api.get(`/devices/${id}/telemetry`),
  getDeviceDashboards: (id: string) => api.get(`/dashboards/${id}`),

  getSecurityRules: () => api.get("/security-rules"),
  updateSecurityRules: (rules: unknown) => api.post("/security-rules", rules),

  broadcast: (data: unknown) => api.post("/broadcast", data),
  alertUser: (data: unknown) => api.post("/users/alert", data),

  exportUsers: () => api.get("/export/users"),
  exportDevices: () => api.get("/export/devices"),
  exportActivity: () => api.get("/export/activity"),

  getActivity: (params?: Record<string, unknown>) =>
    api.get("/activity", { params }),
  getNotifications: () => api.get("/notifications"),
  getAlerts: () => api.get("/alerts"),

  getPlatformSettings: () => api.get("/platform-settings"),
  updatePlatformSettings: (data: unknown) =>
    api.put("/platform-settings", data),

  getEmailStatus: () => api.get("/email/status"),
  sendTestEmail: (to_email: string) => api.post("/email/test", { to_email }),

  bulkDeleteDevices: (deviceIds: string[]) =>
    api.post("/devices/bulk-delete", { deviceIds }),
  bulkUpdateDevices: (deviceIds: string[], updates: unknown) =>
    api.post("/devices/bulk-update", { deviceIds, updates }),
};

export const systemApi = {
  getHealth: () => baseApi.get("/health"),
  getPublicAppConfig: () => baseApi.get("/app/config"),
};

export const authApi = {
  login: (credentials: URLSearchParams) =>
    axios.post(`${API_BASE_URL}/token`, credentials),
};

export default api;
