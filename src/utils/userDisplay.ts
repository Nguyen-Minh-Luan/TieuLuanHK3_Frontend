export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    const first = parts[0]?.charAt(0) ?? "";
    const last = parts[parts.length - 1]?.charAt(0) ?? "";
    return `${first}${last}`.toUpperCase();
  }
  return (name.slice(0, 2) || "U").toUpperCase();
}

export function getRoleLabel(role: number | null | undefined): string {
  if (role === 1) return "Quản trị viên";
  if (role === 2) return "Kế toán viên";
  if (role === 0) return "Người xem";
  if (role === 3) return "Thủ quỹ";
  if (role === 4) return "Kế toán tổng hợp";
  return "Người dùng";
}

const AVATAR_COLORS = [
  "bg-blue-700",
  "bg-violet-700",
  "bg-emerald-700",
  "bg-amber-700",
  "bg-rose-700",
  "bg-teal-700",
  "bg-indigo-700",
];

export function getAvatarColor(id: number | null | undefined): string {
  if (id == null) return AVATAR_COLORS[0]!;
  return AVATAR_COLORS[id % AVATAR_COLORS.length]!;
}
