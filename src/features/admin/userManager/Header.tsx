import { Search, Bell, HelpCircle } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header id="header-navbar" className="flex justify-between items-center w-full px-8 py-4 sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-surface-container-high/40">
      {/* Search Bar */}
      <div className="flex items-center gap-6">
        <div className="relative group transition-all duration-300">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline-custom opacity-70 group-focus-within:text-primary-custom group-focus-within:opacity-100 transition-colors" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Tìm kiếm trong sổ cái..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-surface-container-high border-none rounded-full pl-11 pr-4 py-2.5 text-sm w-64 focus:w-80 focus:ring-2 focus:ring-primary-custom/20 focus:bg-surface-container-lowest transition-all duration-300 outline-none font-sans text-on-surface-custom placeholder-on-surface-variant-custom/65"
          />
        </div>
      </div>

      {/* Quick Action Group & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Button */}
        <button
          id="btn-notifications"
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant-custom hover:bg-surface-container-high transition-colors cursor-pointer"
          title="Thông báo"
        >
          <Bell size={18} className="stroke-[1.75]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
        </button>

        {/* Support Button */}
        <button
          id="btn-help"
          className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant-custom hover:bg-surface-container-high transition-colors cursor-pointer"
          title="Trợ giúp"
        >
          <HelpCircle size={18} className="stroke-[1.75]" />
        </button>

        <div className="h-8 w-[1px] bg-outline-variant-custom/30 mx-2"></div>

        {/* User Info & Profile Picture */}
        <div className="flex items-center gap-3 pl-2 select-none">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-on-surface-custom leading-tight">Admin Executive</p>
            <p className="text-[10px] text-on-surface-variant-custom font-medium uppercase tracking-wider opacity-85">Hệ thống quản trị</p>
          </div>
          <div className="relative">
            <img
              id="profile-avatar-executive"
              alt="Executive User Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-fixed block cursor-pointer hover:border-primary-custom transition-all"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuqFmklwTOO96LZXRB4tMTuVjvfcxH0jFjB5t0Bt0u82GMpgTLgHzDMHpz9d-5-PGqNNP21m2Dtt_PSbSgEphsrF5ptXMP9wL0T092Jzqa42ynR60ILZV1b-zzu7LXD9IQ-B9D2DT1Ga2gKCALhmYlA-t5DfZsAf5rJTyfkpHZLpJCFpbAPbEyDY6llll2zDiloCtZlgz6ptLdGl-3u53YDVdCUAF6XNvlPC8z6kMvwdu7atlGOVF0lq1MPxNrDfbg0q9KI5tvYUEP"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
