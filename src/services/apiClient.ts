/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to each request (supporting both "token" and "jwt_token" keys)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response handler (handles 401 Unauthorized auto-logout)
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("fullName");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
