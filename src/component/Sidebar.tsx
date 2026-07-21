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
  { icon: LayoutDashboard, label: "Dashboard",      path: "/home" },
  { icon: Receipt,         label: "Transactions",   path: "/transaction" },
  { icon: Coins,           label: "Debt",           path: "/debt" },
  { icon: BarChart3,       label: "Reports",        path: "/report" },
  { icon: Wallet,          label: "Budgets",        path: "/budget" },
  { icon: Tags,            label: "Categories",     path: "/category" },
  { icon: Handshake,       label: "Partners",       path: "/partners" },
  { icon: FileText,        label: "Reconciliation", path: "/reconciliation" },
  { icon: FileText,        label: "Fund Transfer",  path: "/fund-transfer" },
  { icon: FileText,        label: "Documents",      path: "/documents" },
  { icon: User,            label: "Users",          path: "/users" },
];

const MotionLink = motion(Link);

export function Sidebar() {
  const location  = useLocation();
  const currentPath = location.pathname;
  const role = useAppSelector((state) => state.auth.role);

  // Lọc menu theo role — mặc định chỉ hiện Dashboard nếu role không xác định
  const allowedLabels = ROLE_MENU_KEYS[role ?? 0] ?? ["Dashboard"];
  const menuItems = ALL_MENU_ITEMS.filter((item) =>
    allowedLabels.includes(item.label)
  );

  return (
    <aside className="hidden md:flex h-screen w-64 bg-slate-50 border-r border-slate-200/60 flex-col py-6 px-4 shrink-0 sticky top-0">
      <div className="mb-10 px-4">
        <div className="text-xl font-extrabold text-brand-primary font-display">
          Ledger Pro
        </div>
        <div className="text-xs text-slate-500 font-medium tracking-wide uppercase">
          Enterprise Tier
        </div>
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

      <div className="mt-auto pt-6 border-t border-slate-200/50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          whileInView={{ scale: 0.98 }}
          className="w-full primary-gradient text-white font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Entry</span>
        </motion.button>
      </div>
    </aside >
  );
}
