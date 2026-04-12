import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dw_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const backendAPI = {
  login: async (credentials) => api.post("/auth/login", credentials),
  signup: async (payload) => api.post("/auth/signup", payload),

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  processUpload: async (uploadId) => api.post(`/process/${uploadId}`),

  getRecords: async (uploadId, params = {}) => {
    if (!uploadId) throw new Error("Upload ID required");
    return api.get(`/records/${uploadId}`, { params });
  },
  createRecord: async (uploadId, data) =>
    api.post("/records/", data, { params: { upload_id: uploadId } }),
  updateRecord: async (recordId, data) => api.put(`/records/${recordId}`, data),
  deleteRecord: async (recordId) => api.delete(`/records/${recordId}`),

  getAnalytics: async (uploadId) => api.get(`/analytics/${uploadId}`),
  getSummary: async (uploadId) => api.get(`/intelligence/summary/${uploadId}`),
  getAlerts: async (uploadId) => api.get(`/intelligence/alerts/${uploadId}`),
  getReport: async (uploadId, period = "monthly") =>
    api.get(`/intelligence/reports/${uploadId}`, { params: { period } }),
  getPredictions: async (uploadId) =>
    api.get(`/intelligence/predictions/${uploadId}`),
  searchRecords: async (uploadId, params = {}) =>
    api.get(`/intelligence/search/${uploadId}`, { params }),
  exportCsv: (uploadId) => `${API_BASE}/export/${uploadId}/csv`,
  exportXlsx: (uploadId) => `${API_BASE}/export/${uploadId}/xlsx`,
  invoicePdf: (uploadId, recordId) =>
    `${API_BASE}/intelligence/invoice/${uploadId}/${recordId}`,

  chat: async (payload) => api.post("/chat", payload),
};

export default api;
