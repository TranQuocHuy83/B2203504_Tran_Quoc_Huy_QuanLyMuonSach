// src/api/api.service.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response handler (optional)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      alert("⚠️ Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập!");
      // Optionally: chuyển hướng đến trang login
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
