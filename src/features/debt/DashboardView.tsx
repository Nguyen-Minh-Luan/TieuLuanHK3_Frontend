import React from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  Plus,
  PlusCircle,
  Coins
} from 'lucide-react';
import type { Debt } from './types';
import OverviewCards from './OverviewCards';
import DebtTable from './DebtTable';
import OptimizerCard from './OptimizerCard';
import QuickReportCard from './QuickReportCard';

interface DashboardViewProps {
  debts: Debt[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onMarkAsPaid: (id: string) => void;
  onDeleteDebt: (id: string) => void;
  onEditDebt: (debt: Debt) => void;
  onViewDetails: (debt: Debt) => void;
  onNewEntryClick: () => void;
}

export default function DashboardView({
  debts,
  searchTerm,
  onSearchChange,
  onMarkAsPaid,
  onDeleteDebt,
  onEditDebt,
  onViewDetails,
  onNewEntryClick,
}: DashboardViewProps) {
  return (
    <div id="dashboard-view-wrapper" className="flex-1 min-h-screen bg-[#f8f9fb] px-8 py-8 space-y-8 overflow-y-auto select-none font-sans">
      {/* 1. Header Navigation Bar */}
      <header id="dashboard-navbar" className="flex items-center justify-between gap-6">
        {/* Left Search Bar inside top bar */}
        <div id="nav-search-bar" className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-3 h-4 w-4 text-[#94a3b8]" />
          <input
            id="nav-search-input"
            type="text"
            placeholder="Tìm kiếm khoản nợ hoặc mã tham chiếu..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#f1f5f9] placeholder-[#94a3b8] text-sm text-[#0f172a] font-medium pl-11 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#003178]/20 focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Right side navigation utilities */}
        <div id="nav-actions" className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Bell Alert trigger */}
            <button
              id="btn-nav-alert"
              title="Thông báo"
              className="p-2 bg-white hover:bg-[#f1f5f9] rounded-xl text-[#64748b] hover:text-[#0f172a] shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative transition-all"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full ring-2 ring-white" />
            </button>

            {/* Help guidelines FAQ */}
            <button
              id="btn-nav-faq"
              title="Trợ giúp & Hỗ trợ"
              className="p-2 bg-white hover:bg-[#f1f5f9] rounded-xl text-[#64748b] hover:text-[#0f172a] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-[1px] bg-[#cbd5e1]/40" />

          {/* User Profile matching screenshot layout exactly */}
          <div id="admin-profile-badge" className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-[#0f172a]">Alex Nguyen</p>
              <p className="text-[9px] font-mono font-bold text-[#64748b] uppercase tracking-wider">
                ADMINISTRATOR
              </p>
            </div>

            <img
              id="admin-avatar"
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120&h=120"
              alt="Alex Nguyen Avatar"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#003178]/10"
            />
          </div>
        </div>
      </header>

      {/* 2. Main Welcome & Statistics Section */}
      <section id="system-headline-bar" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-[#003178] tracking-tight">
            Quản lý nợ
          </h2>
          <p className="text-xs font-medium text-[#64748b] mt-1.5">
            Theo dõi và quản lý các khoản nợ phải trả định kỳ và phát sinh.
          </p>
        </div>

        {/* Right Button: "Thêm khoản nợ mới" */}
        <button
          id="btn-add-new-debt"
          onClick={onNewEntryClick}
          className="bg-[#003178] hover:bg-[#00255a] text-white py-3 px-6 rounded-xl flex items-center gap-2 font-display text-xs font-bold transition-all shadow-md hover:shadow-indigo-900/10 active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm khoản nợ mới</span>
        </button>
      </section>

      {/* 3. Top Row Metrics Cards */}
      <section id="metrics-summary">
        <OverviewCards debts={debts} />
      </section>

      {/* 4. Core Transactions Data table */}
      <section id="ledger-data-box">
        <DebtTable
          debts={debts}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onMarkAsPaid={onMarkAsPaid}
          onDeleteDebt={onDeleteDebt}
          onEditDebt={onEditDebt}
          onViewDetails={onViewDetails}
        />
      </section>

      {/* 5. Bottom dual analytical cards */}
      <section id="bottom-charts-row" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <OptimizerCard debts={debts} />
        </div>
        <div className="md:col-span-1">
          <QuickReportCard debts={debts} />
        </div>
      </section>
    </div>
  );
}
