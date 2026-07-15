// src/utils/authStorage.ts
/**
 * Danh sách đầy đủ các key liên quan tới auth được lưu trong localStorage.
 * Dùng chung ở mọi nơi cần logout (authSlice, apiClient interceptor, ...)
 * để tránh tình trạng xóa thiếu key, gây "chưa clear state đúng" khi logout.
 */
const AUTH_STORAGE_KEYS = [
  "token",
  "userId",
  "username",
  "fullName",
  "email",
  "role",
] as const;

export function clearAuthStorage(): void {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
