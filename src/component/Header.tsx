import { useState, useRef, useEffect } from "react";
import { Search, Bell, Settings, LogOut, User } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../hooks/useAppDispatch";
import { logout } from "../store/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import ConfirmDialog from "./ConfirmDialog";
import apiClient from "../services/apiClient";

import { getInitials, getRoleLabel, getAvatarColor } from "../utils/userDisplay";

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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 200);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      // Ignore API error
    }
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const displayName = fullName || username || "Người dùng";
  const initials = getInitials(displayName);
  const avatarBg = getAvatarColor(id);
  const roleLabel = getRoleLabel(role);

  return (
    <header className="sticky top-0 w-full z-40 glass-header flex justify-between items-center h-16 px-6 border-b border-outline-variant/20 shadow-sm bg-surface/80 backdrop-blur-xl">
      {/* Left: Logo (mobile) + Search bar */}
      <div className="flex items-center gap-4 flex-1">
        {/* Logo — chỉ hiện trên mobile */}
        <Link
          to="/home"
          className="text-xl font-black text-primary font-display md:hidden hover:opacity-80 transition-opacity"
        >
          Smart Financial
        </Link>

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
          <div
            className="relative"
            ref={menuRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              id="profile-avatar-executive"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-9 h-9 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-sm cursor-pointer ring-2 ring-primary/10 hover:ring-primary/30 transition-all`}
              title={displayName}
            >
              {initials}
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 animate-fade-in z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{roleLabel}</p>
                </div>
                <div className="py-2.5">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-3 group cursor-pointer"
                  >
                    <User className="h-4.5 w-4.5 text-slate-400 group-hover:text-primary transition-colors" />
                    Xem hồ sơ chi tiết
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmLabel="Đăng xuất"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </header>
  );
}
