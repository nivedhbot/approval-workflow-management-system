import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor: attach JWT ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fa_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor: handle 401 ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("fa_token");
      localStorage.removeItem("fa_user");
      const path = window.location.pathname;
      if (path !== "/" && path !== "/login" && path !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth API ──
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

// ── Request API ──
export const requestAPI = {
  create: (data) => api.post("/requests", data),
  getMyRequests: () => api.get("/requests/my-requests"),
  getPending: () => api.get("/requests/pending"),
  approve: (id, comments) => api.put(`/requests/${id}/approve`, { comments }),
  reject: (id, comments) => api.put(`/requests/${id}/reject`, { comments }),
};

export default api;
