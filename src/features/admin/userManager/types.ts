// Thay enum bằng Object kèm theo 'as const'
export const UserRole = {
  ADMIN: "Quản trị viên",
  KETOAN_THU_CHI: "Kế toán Thu Chi",
  KE_TOAN_QUY: "Kế toán Quỹ",
  TONGHOP: "Kế toán Tổng hợp",
  VIEWER: "Người xem"
} as const;

// Tạo Type dựa trên các Value của Object trên
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động"
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarInitials: string;
  avatarBg: string;
}

export interface UserStats {
  totalUsers: number;
  monthlyIncreasePercent: number;
}
