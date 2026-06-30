import { UserRole, UserStatus, type User } from './types';

export interface UserDTO {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: number; // 0 = VIEWER, 1 = ADMIN, 2 = ACCOUNTANT
  status?: string; // "ACTIVE" | "INACTIVE"
  token?: string;
  message?: string;
}

export interface UserRequest {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  role: number;
  status: string;
}

export function mapRoleToLabel(role: number): UserRole {
  if (role === 1) return UserRole.ADMIN;
  if (role === 2) return UserRole.ACCOUNTANT;
  return UserRole.VIEWER;
}

export function mapLabelToRole(label: UserRole): number {
  if (label === UserRole.ADMIN) return 1;
  if (label === UserRole.ACCOUNTANT) return 2;
  return 0;
}

export function mapStatusToLabel(status?: string): UserStatus {
  if (status === 'INACTIVE') return UserStatus.INACTIVE;
  return UserStatus.ACTIVE;
}

export function mapLabelToStatus(label: UserStatus): string {
  if (label === UserStatus.INACTIVE) return 'INACTIVE';
  return 'ACTIVE';
}

const bgColors = [
  "bg-[#003178] text-white",
  "bg-amber-800 text-amber-100",
  "bg-teal-700 text-teal-100",
  "bg-purple-700 text-purple-100",
  "bg-indigo-700 text-indigo-100",
  "bg-rose-700 text-rose-100"
];

export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    const first = parts[0]?.charAt(0) || "";
    const last = parts[parts.length - 1]?.charAt(0) || "";
    return `${first}${last}`.toUpperCase();
  }
  return (name.slice(0, 2) || "U").toUpperCase();
}

export function mapUserDTOToUiUser(dto: UserDTO): User {
  const colorIndex = dto.id % bgColors.length;
  const avatarBg = bgColors[colorIndex] || "bg-[#003178] text-white";
  return {
    id: String(dto.id),
    name: dto.fullName ?? dto.username,
    email: dto.email,
    role: mapRoleToLabel(dto.role),
    status: mapStatusToLabel(dto.status),
    avatarInitials: getInitials(dto.fullName ?? dto.username),
    avatarBg
  };
}
