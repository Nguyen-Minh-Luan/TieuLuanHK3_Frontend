import {
  BarChart3,
  Coins,
  Handshake,
  LayoutDashboard,
  Plus,
  Receipt,
  Settings,
  Tags,
  User,
  Wallet,
  FileText,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/useAppDispatch";
import { ROLE_MENU_KEYS } from "../lib/permissions";

const ALL_MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Tổng quan", path: "/home" },
  { icon: Receipt, label: "Giao dịch", path: "/transaction" },
  { icon: Coins, label: "Công nợ", path: "/debt" },
  { icon: BarChart3, label: "Báo cáo", path: "/report" },
  { icon: Wallet, label: "Ngân sách", path: "/budget" },
  { icon: Tags, label: "Danh mục", path: "/category" },
  { icon: Handshake, label: "Đối tác", path: "/partners" },
  { icon: FileText, label: "Đối soát quỹ", path: "/reconciliation" },
  { icon: FileText, label: "Chuyển quỹ", path: "/fund-transfer" },
  { icon: FileText, label: "Chứng từ", path: "/documents" },
  { icon: User, label: "Người dùng", path: "/users" },
];

const MotionLink = motion(Link);

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const role = useAppSelector((state) => state.auth.role);

  // Lọc menu theo role — mặc định chỉ hiện Dashboard nếu role không xác định
  const allowedPaths = ROLE_MENU_KEYS[role ?? 0] ?? ["/home"];
  const menuItems = ALL_MENU_ITEMS.filter((item) =>
    allowedPaths.includes(item.path)
  );

  return (
    <aside className="hidden md:flex h-screen w-64 bg-slate-50 border-r border-slate-200/60 flex-col py-6 px-4 shrink-0 sticky top-0">
      <div className="mb-10 px-4">
        <Link
          to="/home"
          className="group inline-flex items-center gap-3 p-2 rounded-xl transition-all duration-300 hover:bg-surface-container-low"
        >
          {/* Typography */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xl font-extrabold font-display tracking-tight text-brand-primary group-hover:text-primary-container transition-colors">
                Smart Financial
              </span>
              {/* Chấm accent màu Secondary */}
              <span className="w-1.5 h-1.5 rounded-full bg-secondary transition-transform duration-300 group-hover:scale-150" />
            </div>
            <span className="text-[14px] font-semibold text-slate-500 font-sans tracking-[0.2em] uppercase leading-none opacity-80 group-hover:opacity-100 group-hover:text-brand-text transition-all">
              Management
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isItemActive =
            (item.path === "/home" && currentPath === "/home") ||
            (item.path === "/users" && (currentPath === "/users" || currentPath === "/admin/userManager")) ||
            (item.path !== "/home" && item.path !== "/users" && currentPath.startsWith(item.path));

          return (
            <MotionLink
              key={item.label}
              to={item.path}
              whileHover={{ x: 4 }}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                isItemActive
                  ? "bg-blue-50 text-brand-primary font-bold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-brand-primary",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  isItemActive
                    ? "text-brand-primary"
                    : "text-slate-400 group-hover:text-brand-primary",
                )}
              />
              <span>{item.label}</span>
            </MotionLink>
          );
        })}
      </nav>
    </aside >
  );
}
