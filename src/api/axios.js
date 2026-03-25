import axios from "axios";
import { triggerLogout } from "../context/AuthContext";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 properly
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      triggerLogout(); // 🔥 THIS updates React state
    }
    return Promise.reject(error);
  }
);

export default api;