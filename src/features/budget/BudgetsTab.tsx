import React, { useState } from 'react';
import { PlusCircle, Search, Edit2, ShieldAlert, CheckCircle2, AlertTriangle, Clock, HelpCircle, Trash2 } from 'lucide-react';
import type { Fund } from './types';

interface BudgetsTabProps {
  funds: Fund[];
  isLoading?: boolean;
  error?: string | null;
  onOpenAddFund: () => void;
  onOpenEditFund: (fund: Fund) => void;
  onDeleteFund: (id: string) => void;
  searchText: string;
}

export default function BudgetsTab({
  funds,
  isLoading = false,
  error = null,
  onOpenAddFund,
  onOpenEditFund,
  onDeleteFund,
  searchText: globalSearchText
}: BudgetsTabProps) {
  const [localSearchText, setLocalSearchText] = useState('');

  // Format currency with de-DE locale to get dots, and append '$' to match the screenshot "1.500.000$"
  const formatValue = (val: number) => {
    return val.toLocaleString('de-DE') + '$';
  };

  // Combine global search with local tab search
  const query = (localSearchText || globalSearchText || '').trim().toLowerCase();

  const filteredFunds = funds.filter(f => {
    if (!query) return true;
    return f.name.toLowerCase().includes(query) ||
      f.type.toLowerCase().includes(query) ||
      f.code.toLowerCase().includes(query) ||
      f.status.toLowerCase().includes(query);
  });

  return (
    <div className="flex-1 flex flex-col p-8 bg-brand-bg-alt overflow-y-auto" id="budgets-tab-container">
      {/* Upper Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8" id="budgets-header-block">
        <div id="budgets-title-block">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-heading" id="main-ledger-title">
            Quản lý Nguồn vốn
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-sans" id="main-ledger-sub">
            Theo dõi và điều phối các nguồn lực tài chính của tổ chức
          </p>
        </div>

        {/* Thêm Nguồn tiền Mới CTA Button with exact branding */}
        <button
          id="btn-add-fund-main"
          onClick={onOpenAddFund}
          className="bg-brand-primary hover:bg-brand-primary-light text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_4px_12px_rgba(0,49,120,0.12)] hover:shadow-[0_6px_16px_rgba(0,49,120,0.2)] cursor-pointer text-sm font-heading"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          <span>Thêm Nguồn tiền Mới</span>
        </button>
      </div>

      {/* Main Budget Card - The "No border" rule applied. Soft background shifts. */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,25,69,0.02)] overflow-hidden" id="budgets-main-card">
        {/* Card Header utilities */}
        <div className="p-6 pb-2 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="budgets-card-header">
          <h2 className="text-base font-bold text-slate-900 font-heading">
            Danh sách Nguồn tiền
          </h2>

          {/* Quick Filter Box */}
          <div className="relative w-full sm:w-64" id="budgets-card-search">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              id="budgets-filter-input"
              type="text"
              value={localSearchText}
              onChange={(e) => setLocalSearchText(e.target.value)}
              placeholder="Tìm nguồn tiền..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border-0 text-xs text-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-slate-400 font-sans"
            />
          </div>
        </div>

        {/* Interactive Responsive Table */}
        <div className="overflow-x-auto w-full" id="budgets-table-wrapper">

          {/* Loading State */}
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400" id="loading-indicator">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-primary rounded-full animate-spin" />
              <span className="text-xs font-medium">Đang tải danh sách nguồn tiền...</span>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="py-12 px-6 flex flex-col items-center gap-2" id="error-indicator">
              <span className="text-2xl">⚠️</span>
              <span className="text-sm font-semibold text-rose-600">Không thể tải dữ liệu</span>
              <span className="text-xs text-slate-400">{error}</span>
            </div>
          )}

          {/* Table — chỉ hiển thị khi không loading và không có lỗi */}
          {!isLoading && !error && (
          <table className="w-full text-left border-collapse" id="budgets-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-transparent text-[11px] font-bold text-slate-400 tracking-wider font-heading uppercase" id="budgets-table-head">
                <th className="py-4 px-6 w-[35%]">Tên nguồn tiền</th>
                <th className="py-4 px-4 w-[12%] text-center">Loại</th>
                <th className="py-4 px-4 w-[15%] text-right">Tổng vốn</th>
                <th className="py-4 px-4 w-[15%] text-right">Số dư khả dụng</th>
                <th className="py-4 px-4 w-[15%] text-center">Trạng thái</th>
                <th className="py-4 px-6 w-[8%] text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50" id="budgets-table-body">
              {filteredFunds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center text-slate-400 font-medium text-sm">
                    Không tìm thấy nguồn tiền nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredFunds.map((fund) => {
                  // Class and badge rendering parameters based on exact status colors in image
                  let statusStyles = '';
                  let balanceColor = 'text-brand-primary-light';

                  if (fund.status === 'HOẠT ĐỘNG') {
                    statusStyles = 'bg-cyan-50/50 text-cyan-600';
                  } else if (fund.status === 'GẦN GIỚI HẠN') {
                    statusStyles = 'bg-rose-50 text-rose-500 font-bold';
                    balanceColor = 'text-rose-500 font-bold'; // HSBC outstanding balance is colored in red text
                  } else {
                    statusStyles = 'bg-slate-100 text-slate-500';
                  }

                  return (
                    <tr
                      key={fund.id}
                      className="hover:bg-slate-50/40 transition-colors"
                      id={`fund-row-${fund.id}`}
                    >
                      {/* Name of Fund with Code below */}
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-0.5" id={`fund-info-${fund.id}`}>
                          <span className="text-sm font-bold text-slate-800 transition-colors hover:text-brand-primary">
                            {fund.name}
                          </span>
                          <span className="text-[10px] font-mono tracking-wider text-slate-400 font-medium uppercase">
                            {fund.code}
                          </span>
                        </div>
                      </td>

                      {/* Type of Fund with pretty badge representation */}
                      <td className="py-5 px-4 text-center">
                        <span className="text-xs text-slate-600 font-medium">
                          {fund.type}
                        </span>
                      </td>

                      {/* Total Capital */}
                      <td className="py-5 px-4 text-right">
                        <span className="text-sm font-semibold text-slate-700 font-mono">
                          {formatValue(fund.totalCapital)}
                        </span>
                      </td>

                      {/* Available Balance with responsive styling */}
                      <td className="py-5 px-4 text-right">
                        <span className={`text-sm font-bold font-mono ${balanceColor}`}>
                          {formatValue(fund.availableBalance)}
                        </span>
                      </td>

                      {/* Status Tag exactly styled like the screenshot badges */}
                      <td className="py-5 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${statusStyles}`}>
                          {fund.status}
                        </span>
                      </td>

                      {/* Action buttons (Edit & Delete) */}
                      <td className="py-5 px-6 table-cell">
                        <div className="flex items-center justify-center gap-3" id={`actions-group-${fund.id}`}>
                          {/* Edit Pencil Icon */}
                          <button
                            id={`btn-edit-${fund.id}`}
                            onClick={() => onOpenEditFund(fund)}
                            title="Chỉnh sửa nguồn vốn"
                            className="p-1.5 text-slate-400 hover:text-brand-primary bg-slate-50 hover:bg-[#e8f1fd] rounded-lg transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Trash Action */}
                          <button
                            id={`btn-delete-${fund.id}`}
                            onClick={() => {
                              if (window.confirm(`Xoá nguồn tiền "${fund.name}"? Thao tác này không thể hoàn tác.`)) {
                                onDeleteFund(fund.id);
                              }
                            }}
                            title="Xóa nguồn tiền"
                            className="p-1.5 text-slate-300 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Embedded Informative Widgets matching Design Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8" id="budgets-bottom-cards">
        <div className="p-5 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex gap-4" id="info-widget-1">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-heading">Phân định Minh bạch</h4>
            <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">
              Tất cả các nguồn lực tài chính đều có dòng tiền gắn chặt với các tài liệu dự toán, tối ưu hoá dòng chảy vốn.
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex gap-4" id="info-widget-2">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-heading">Hạn mức Tín dụng</h4>
            <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">
              Cảnh báo thông minh tự động kích hoạt khi số dư thực tế thấp hơn 10% tổng nguồn lực ban đầu, bảo toàn thanh khoản.
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex gap-4" id="info-widget-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-heading">Đồng bộ Thời thực</h4>
            <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">
              Dữ liệu được cập nhật theo múi giờ hệ thống doanh nghiệp (UTC). Sẵn sàng kết xuất báo cáo nhanh chỉ cần 1 click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
