/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from "axios";
import { clearAuthStorage } from "../utils/authStorage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to each request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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
      // Trước đây chỉ xóa 4/6 key (thiếu "email" và "role"), khiến sau khi
      // reload trang, authSlice khôi phục nhầm role/email cũ dù token đã mất.
      // Dùng chung helper với authSlice.logout() để đảm bảo xóa đủ và nhất quán.
      clearAuthStorage();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
