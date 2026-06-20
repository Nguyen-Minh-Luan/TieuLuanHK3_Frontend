import React, { useState, useMemo } from 'react';
import {
  Building2,
  Briefcase,
  Home,
  Truck,
  Layers,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Trash2,
  Eye,
  Calendar,
  Search,
  Check
} from 'lucide-react';
import type { Debt, DebtStatus, CreditorType } from './types';

interface DebtTableProps {
  debts: Debt[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onMarkAsPaid: (id: string) => void;
  onDeleteDebt: (id: string) => void;
  onEditDebt: (debt: Debt) => void;
  onViewDetails: (debt: Debt) => void;
}

export default function DebtTable({
  debts,
  searchTerm,
  onSearchChange,
  onMarkAsPaid,
  onDeleteDebt,
  onEditDebt,
  onViewDetails,
}: DebtTableProps) {
  // Filters
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Overdue' | 'Paid'>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'thirty-day' | 'this-month' | 'past-due'>('all');
  const [showDatePickerDropdown, setShowDatePickerDropdown] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4; // To exactly show 4 rows as in the mockup screenshot!

  // Creditor Brand Styles
  const getCreditorStyle = (type: CreditorType) => {
    switch (type) {
      case 'bank':
        return {
          icon: Building2,
          bg: 'bg-[#fdf2f2]',
          text: 'text-[#d91c1c]',
        };
      case 'tech':
        return {
          icon: Briefcase,
          bg: 'bg-[#eff6ff]',
          text: 'text-[#1d4ed8]',
        };
      case 'real_estate':
        return {
          icon: Home,
          bg: 'bg-[#f0fdf4]',
          text: 'text-[#15803d]',
        };
      case 'logistics':
        return {
          icon: Truck,
          bg: 'bg-[#faf5ff]',
          text: 'text-[#6b21a8]',
        };
      default:
        return {
          icon: Layers,
          bg: 'bg-[#f1f5f9]',
          text: 'text-[#475569]',
        };
    }
  };

  // Status Badge Styles
  const getStatusBadge = (status: DebtStatus) => {
    switch (status) {
      case 'Critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]/30">
            Critical
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]/30">
            Warning
          </span>
        );
      case 'Fine':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#eff6ff] text-[#1e40af] border border-[#93c5fd]/30">
            Fine
          </span>
        );
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#f0fdf4] text-[#166534] border border-[#86efac]/30">
            Đã thanh toán
          </span>
        );
      default:
        return null;
    }
  };

  // Category Badge helper for LOẠI NỢ
  const getCategoryBadge = (type: CreditorType) => {
    switch (type) {
      case 'receivable':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f0fdf4] text-[#166534] border border-[#86efac]/20">
            Nợ phải thu
          </span>
        );
      case 'payable':
      case 'bank':
      case 'tech':
      case 'real_estate':
      case 'logistics':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]/20">
            Nợ phải chi
          </span>
        );
    }
  };

  // 1. Process Filtering
  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      // Search Box Filter
      const matchesSearch =
        debt.creditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debt.referenceCode.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Status Tabs Filter
      if (activeTab === 'Active' && debt.status === 'Paid') return false;
      if (activeTab === 'Overdue' && debt.status !== 'Critical') return false;
      if (activeTab === 'Paid' && debt.status !== 'Paid') return false;

      // Date Range Filters (simulated presets)
      if (dateFilter === 'thirty-day') {
        // e.g., only items created in may / near dates
        return debt.dateCreated.includes('05/2024') || debt.dateCreated.includes('06/2024');
      }
      if (dateFilter === 'past-due') {
        return debt.status === 'Critical' || debt.status === 'Warning';
      }

      return true;
    });
  }, [debts, searchTerm, activeTab, dateFilter]);

  // Reset pagination on filter change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, dateFilter]);

  // 2. Pagination Calculations
  const totalItems = filteredDebts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const currentItems = useMemo(() => {
    return filteredDebts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDebts, startIndex]);

  // Helper to format Vietnamese Dong
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    const headers = ['Ngày tạo', 'Chủ nợ', 'Mã tham chiếu', 'Số tiền', 'Hạn thanh toán', 'Trạng thái', 'Mô tả'];
    const rows = debts.map(d => [
      d.dateCreated,
      d.creditor,
      d.referenceCode,
      d.amount,
      d.dueDate,
      d.status,
      d.description || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Báo cáo nợ - Equity Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="debt-table-section" className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.02)] pt-6 font-sans select-none overflow-hidden">
      {/* Table Toolbar controls matching image */}
      <div id="table-toolbar" className="px-6 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#f1f5f9]">
        {/* Left Side: Table Title */}
        <div>
          <h4 className="text-sm font-extrabold text-[#0f172a] font-display tracking-tight flex items-center gap-2">
            <span>Sổ theo dõi công nợ</span>
            <span className="text-[10px] font-mono text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full font-normal">
              {filteredDebts.length} Khoản
            </span>
          </h4>
        </div>

        {/* Right Side: Date Picker Trigger & Action Icons */}
        <div id="toolbar-actions" className="flex items-center gap-3">
          {/* Custom Datepicker dropdown */}
          <div className="relative">
            <button
              id="btn-date-filter"
              onClick={() => setShowDatePickerDropdown(!showDatePickerDropdown)}
              className="flex items-center gap-2 border border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8f9fb] text-xs font-semibold text-[#475569] px-4 py-2 rounded-xl transition-all"
            >
              <Calendar className="w-4 h-4 text-[#64748b]" />
              <span>
                {dateFilter === 'all' && 'Khoảng ngày'}
                {dateFilter === 'thirty-day' && '30 ngày qua'}
                {dateFilter === 'this-month' && 'Tháng này'}
                {dateFilter === 'past-due' && 'Cảnh báo/Quá hạn'}
              </span>
            </button>

            {showDatePickerDropdown && (
              <div id="datepicker-dropdown" className="absolute z-10 mt-2 right-0 w-52 bg-white rounded-xl shadow-xl border border-[#f1f5f9] p-2 space-y-1">
                <button
                  onClick={() => { setDateFilter('all'); setShowDatePickerDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg ${dateFilter === 'all' ? 'bg-[#f0fdf4] text-[#166534]' : 'text-[#475569] hover:bg-[#f1f5f9]'}`}
                >
                  Tất cả thời gian
                </button>
                <button
                  onClick={() => { setDateFilter('thirty-day'); setShowDatePickerDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg ${dateFilter === 'thirty-day' ? 'bg-[#f0fdf4] text-[#166534]' : 'text-[#475569] hover:bg-[#f1f5f9]'}`}
                >
                  Gần đây (Tháng 5-6)
                </button>
                <button
                  onClick={() => { setDateFilter('past-due'); setShowDatePickerDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg ${dateFilter === 'past-due' ? 'bg-[#fee2e2] text-[#991b1b]' : 'text-[#475569] hover:bg-[#f1f5f9]'}`}
                >
                  Chỉ nợ rủi ro (Critical/Warning)
                </button>
              </div>
            )}
          </div>

          {/* Table Actions Icons */}
          <button
            id="btn-trigger-filter"
            title="Bộ lọc nâng cao"
            className="p-2 border border-[#e2e8f0] hover:bg-[#f1f5f9] rounded-xl text-[#64748b] transition-all"
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            id="btn-export-csv"
            title="Xuất Excel/CSV"
            onClick={handleExportCSV}
            className="p-2 border border-[#e2e8f0] hover:bg-[#f1f5f9] rounded-xl text-[#64748b] transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <div id="table-scroll-container" className="overflow-x-auto">
        <table id="debt-data-table" className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10px] font-mono tracking-widest text-[#64748b] uppercase border-b border-[#eaecf0]">
              <th className="w-[14.28%] py-4 px-4 font-semibold text-center">NGÀY TẠO</th>
              <th className="w-[14.28%] py-4 px-4 font-semibold text-center">TIÊU ĐỀ</th>
              <th className="w-[14.28%] py-4 px-4 font-semibold text-center">ĐỐI TÁC</th>
              <th className="w-[14.28%] py-4 px-4 font-semibold text-center">CÒN LẠI</th>
              <th className="w-[14.28%] py-4 px-4 font-semibold text-center">SỐ TIỀN NỢ</th>
              <th className="w-[14.28%] py-4 px-4 font-semibold text-center">LOẠI NỢ</th>
              <th className="w-[14.28%] py-4 px-4 font-semibold text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {currentItems.length > 0 ? (
              currentItems.map((debt, index) => {
                const cStyle = getCreditorStyle(debt.creditorType);
                const CredIcon = cStyle.icon;

                return (
                  <tr
                    key={debt.id}
                    id={`row-${debt.id}`}
                    className="hover:bg-[#f8f9fb]/60 group transition-all duration-150"
                  >
                    {/* Creation Date column */}
                    <td className="py-4.5 px-4 text-center">
                      <span className="text-[13px] font-medium text-[#64748b] font-sans">
                        {debt.dateCreated}
                      </span>
                    </td>

                    {/* Title / Creditor column */}
                    <td className="py-4.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className={`p-2 rounded-xl ${cStyle.bg} ${cStyle.text} shrink-0`}>
                          <CredIcon className="w-[16px] h-[16px]" />
                        </div>
                        <span className="text-[14px] font-bold text-[#0f172a] font-sans truncate max-w-[125px]">
                          {debt.creditor}
                        </span>
                      </div>
                    </td>

                    {/* Reference Code column */}
                    <td className="py-4.5 px-4 text-center">
                      <span className="text-xs font-mono font-medium text-[#475569] bg-[#f8f9fb] px-2.5 py-1 rounded-md border border-[#cbd5e1]/10">
                        {debt.referenceCode}
                      </span>
                    </td>

                    {/* Remaining Amount column */}
                    <td className="py-4.5 px-4 text-center">
                      <span className="text-[14px] font-extrabold text-[#0f172a] font-sans tracking-tight">
                        {formatVND(debt.status === 'Paid' ? 0 : debt.amount)}
                      </span>
                    </td>

                    {/* Total Debt Amount column */}
                    <td className="py-4.5 px-4 text-center">
                      <span className="text-[14px] font-semibold text-[#475569] font-sans">
                        {formatVND(debt.amount)}
                      </span>
                    </td>

                    {/* Category Type Badge Column */}
                    <td className="py-4.5 px-4 text-center">
                      {getCategoryBadge(debt.creditorType)}
                    </td>

                    {/* Operational Table Controls column - Only trash bin as requested */}
                    <td className="py-4.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`btn-delete-${debt.id}`}
                          title="Xóa"
                          onClick={() => onDeleteDebt(debt.id)}
                          className="p-1.5 hover:bg-[#fee2e2] rounded-lg text-[#ef4444] hover:text-[#b91c1c] transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <p className="text-sm text-[#94a3b8] font-medium">Không tìm thấy khoản nợ nào khớp với bộ lọc.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div id="table-pagination" className="px-6 py-4 bg-[#f8f9fb]/50 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Indicator */}
        <p className="text-xs text-[#64748b] font-medium">
          Hiển thị{' '}
          <span className="font-semibold text-[#0f172a]">
            {totalItems > 0 ? startIndex + 1 : 0}
          </span>
          -
          <span className="font-semibold text-[#0f172a]">{endIndex}</span> trong{' '}
          <span className="font-semibold text-[#0f172a]">{totalItems}</span> khoản nợ
        </p>

        {/* Right Nav Page numbers */}
        <div id="pagination-controls" className="flex items-center gap-1.5">
          <button
            id="btn-prev-page"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-1.5 border border-[#e2e8f0] rounded-lg hover:bg-white text-[#64748b] disabled:opacity-40 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numbers list page */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              id={`btn-page-${page}`}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === page
                  ? 'bg-[#003178] text-white shadow-sm'
                  : 'border border-transparent hover:border-[#e2e8f0] text-[#64748b] hover:bg-white hover:text-[#0f172a]'
                }`}
            >
              {page}
            </button>
          ))}

          <button
            id="btn-next-page"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-1.5 border border-[#e2e8f0] rounded-lg hover:bg-white text-[#64748b] disabled:opacity-40 disabled:hover:bg-transparent transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
