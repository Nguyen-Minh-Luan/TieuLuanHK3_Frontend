import { Search, Bell, Settings } from "lucide-react";
import { useAppSelector } from "../hooks/useAppDispatch";

// --- Helper: lấy 2 chữ cái đầu của tên ---
function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    const first = parts[0]?.charAt(0) ?? "";
    const last = parts[parts.length - 1]?.charAt(0) ?? "";
    return `${first}${last}`.toUpperCase();
  }
  return (name.slice(0, 2) || "U").toUpperCase();
}

// --- Helper: ánh xạ role number sang nhãn tiếng Việt ---
function getRoleLabel(role: number | null | undefined): string {
  if (role === 1) return "Quản trị viên";
  if (role === 2) return "Kế toán viên";
  if (role === 0) return "Người xem";
  return "Người dùng";
}

// --- Helper: màu nền avatar cố định theo id ---
const AVATAR_COLORS = [
  "bg-blue-700",
  "bg-violet-700",
  "bg-emerald-700",
  "bg-amber-700",
  "bg-rose-700",
  "bg-teal-700",
  "bg-indigo-700",
];
function getAvatarColor(id: number | null | undefined): string {
  if (id == null) return AVATAR_COLORS[0]!;
  return AVATAR_COLORS[id % AVATAR_COLORS.length]!;
}

// --- Props ---
export interface HeaderProps {
  /** Placeholder của ô tìm kiếm */
  searchPlaceholder?: string;
  /** Giá trị hiện tại của ô tìm kiếm (controlled) */
  searchValue?: string;
  /** Callback khi người dùng thay đổi giá trị tìm kiếm */
  onSearchChange?: (value: string) => void;
  /** Có hiển thị thanh tìm kiếm không. Mặc định: true */
  showSearch?: boolean;
}

export default function Header({
  searchPlaceholder = "Tìm kiếm giao dịch, danh mục, đối tác...",
  searchValue,
  onSearchChange,
  showSearch = true,
}: HeaderProps) {
  const { fullName, username, role, id } = useAppSelector((state) => state.auth);

  const displayName = fullName || username || "Người dùng";
  const initials = getInitials(displayName);
  const avatarBg = getAvatarColor(id);
  const roleLabel = getRoleLabel(role);

  return (
    <header className="sticky top-0 w-full z-40 glass-header flex justify-between items-center h-16 px-6 border-b border-outline-variant/20 shadow-sm bg-surface/80 backdrop-blur-xl">
      {/* Left: Logo (mobile) + Search bar */}
      <div className="flex items-center gap-4 flex-1">
        {/* Logo — chỉ hiện trên mobile */}
        <span className="text-2xl font-black text-primary font-display md:hidden">LP</span>

        {/* Search bar — ẩn trên mobile, ẩn nếu showSearch=false */}
        {showSearch && (
          <div className="hidden md:flex items-center bg-surface-container-high px-4 py-2 rounded-full w-96 group focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <Search
              size={18}
              className="text-outline group-focus-within:text-primary shrink-0"
            />
            <input
              id="global-search-input"
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-outline/70 ml-2 outline-none"
            />
          </div>
        )}
      </div>

      {/* Right: Notifications, Settings, Profile */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <button
          id="btn-notifications"
          title="Thông báo"
          className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all relative"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </button>

        {/* Settings */}
        <button
          id="btn-settings"
          title="Cài đặt"
          className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all"
        >
          <Settings size={20} />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-outline-variant/30 mx-1" />

        {/* User info + Avatar */}
        <div className="flex items-center gap-3 select-none">
          {/* Tên + Role (ẩn trên mobile nhỏ) */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-on-surface-custom leading-tight">
              {displayName}
            </p>
            <p className="text-[10px] text-on-surface-variant-custom font-medium uppercase tracking-wider opacity-85">
              {roleLabel}
            </p>
          </div>

          {/* Avatar initials */}
          <div className="relative">
            <div
              id="profile-avatar-executive"
              className={`w-9 h-9 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-sm cursor-pointer ring-2 ring-primary/10 hover:ring-primary/30 transition-all`}
              title={displayName}
            >
              {initials}
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
