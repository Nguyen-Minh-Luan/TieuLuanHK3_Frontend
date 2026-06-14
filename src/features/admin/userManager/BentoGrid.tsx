import { Users, Search, ChevronDown, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { UserRole, UserStatus } from "./types.ts";

interface BentoGridProps {
  totalUsersCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onResetFilters: () => void;
}

export default function BentoGrid({
  totalUsersCount,
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onResetFilters
}: BentoGridProps) {
  return (
    <div id="stats-filters-bento-grid" className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">

      {/* Stats Card (Left, takes 1 column on large screens) */}
      <div
        id="stats-card-users"
        className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high/40 flex flex-col justify-between transition-all duration-300 hover:shadow-md"
      >
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 bg-primary-custom/5 text-primary-custom rounded-xl flex items-center justify-center">
            <Users size={20} className="stroke-[2] text-primary-custom" />
          </div>
          <span className="text-[11px] font-bold text-secondary-custom uppercase tracking-wider bg-secondary-custom/10 px-2.5 py-1 rounded-full flex items-center gap-1">
            <ArrowUpRight size={12} className="stroke-[2.5]" />
            +12% THÁNG NÀY
          </span>
        </div>
        <div className="mt-6">
          <p className="text-4xl font-display font-extrabold text-on-surface-custom tracking-tight">
            {totalUsersCount.toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-on-surface-variant-custom mt-1 uppercase tracking-wide opacity-80">
            Tổng số người dùng
          </p>
        </div>
      </div>

      {/* Search & Filter Card (Right, spans 3 columns on large screens) */}
      <div
        id="filters-control-panel"
        className="lg:col-span-3 bg-surface-container-low p-6 rounded-2xl flex flex-col md:flex-row items-center gap-4 border border-surface-container-high/20"
      >
        {/* Input search */}
        <div className="w-full md:flex-1 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-custom opacity-70 group-focus-within:text-primary-custom group-focus-within:opacity-100 transition-colors" />
          <input
            id="user-search-input"
            type="text"
            placeholder="Tìm tên, email hoặc mã nhân viên..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-surface-container-lowest border border-surface-container-highest/20 rounded-xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary-custom/15 transition-all font-sans text-on-surface-custom placeholder-on-surface-variant-custom/60"
          />
        </div>

        {/* Dropdowns and Action Menu */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Select Role */}
          <div className="relative flex-1 md:flex-none min-w-[150px]">
            <select
              id="filter-role-select"
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full appearance-none bg-surface-container-lowest border border-surface-container-highest/10 rounded-xl px-4 py-3.5 text-sm font-semibold text-on-surface-custom focus:ring-2 focus:ring-primary-custom/15 outline-none pr-10 cursor-pointer"
            >
              <option value="">Tất cả Vai trò</option>
              <option value={UserRole.ADMIN}>{UserRole.ADMIN}</option>
              <option value={UserRole.ACCOUNTANT}>{UserRole.ACCOUNTANT}</option>
              <option value={UserRole.VIEWER}>{UserRole.VIEWER}</option>
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-outline-custom opacity-80" />
          </div>

          {/* Select Status */}
          <div className="relative flex-1 md:flex-none min-w-[150px]">
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full appearance-none bg-surface-container-lowest border border-surface-container-highest/10 rounded-xl px-4 py-3.5 text-sm font-semibold text-on-surface-custom focus:ring-2 focus:ring-primary-custom/15 outline-none pr-10 cursor-pointer"
            >
              <option value="">Trạng thái</option>
              <option value={UserStatus.ACTIVE}>{UserStatus.ACTIVE}</option>
              <option value={UserStatus.INACTIVE}>{UserStatus.INACTIVE}</option>
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-outline-custom opacity-80" />
          </div>

          {/* Reset button */}
          <button
            id="btn-reset-filters"
            onClick={onResetFilters}
            className="bg-surface-container-high text-on-surface-variant-custom p-3.5 rounded-xl hover:bg-surface-container-highest hover:text-on-surface-custom transition-all duration-200 cursor-pointer"
            title="Đặt lại bộ lọc"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}
