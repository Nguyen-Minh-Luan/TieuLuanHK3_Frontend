import { useState, useEffect } from 'react';
import {
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Trash2,
  Eye,
  Pencil,
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
} from 'lucide-react';
import type { DebtDTO } from './apiTypes';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchDebtPayments } from '../../store/slices/debtSlice';
import DebtPaymentsList from './DebtPaymentsList';
import { formatVND } from '../../utils/formatCurrency';

interface DebtTableProps {
  debts: DebtDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onMarkAsPaid: (id: number) => void;
  onDeleteDebt: (id: number) => void;
  onEditDebt: (debt: DebtDTO) => void;
  onViewDetails: (debt: DebtDTO) => void;
}


const formatDate = (isoDate?: string) => {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/** Badge trạng thái thanh toán */
const PaymentBadge = ({ isPaid, remainingAmount }: { isPaid?: boolean; remainingAmount?: number }) => {
  if (isPaid) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f0fdf4] text-[#166534] border border-[#86efac]/30">
        <CheckCircle className="w-3 h-3 mr-1" /> Đã thanh toán
      </span>
    );
  }
  if (remainingAmount != null && remainingAmount > 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]/30">
        Chưa thanh toán
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#475569]">
      Chưa xác định
    </span>
  );
};

/** Badge loại nợ */
const DebtTypeBadge = ({ type }: { type: 'RECEIVABLE' | 'PAYABLE' }) =>
  type === 'RECEIVABLE' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f0fdf4] text-[#166534] border border-[#86efac]/20">
      <ArrowDownLeft className="w-3 h-3" /> Phải thu
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]/20">
      <ArrowUpRight className="w-3 h-3" /> Phải chi
    </span>
  );

export default function DebtTable({
  debts,
  totalElements,
  totalPages,
  currentPage,
  onPageChange,
  onMarkAsPaid,
  onDeleteDebt,
  onEditDebt,
  onViewDetails,
}: DebtTableProps) {
  const dispatch = useAppDispatch();
  const paymentsByDebtId = useAppSelector((s) => s.debt.paymentsByDebtId);

  /** Accordion: chỉ 1 dòng mở tại 1 thời điểm */
  const [expandedDebtId, setExpandedDebtId] = useState<number | null>(null);

  // Đóng sub-row khi đổi trang để tránh hiển thị dữ liệu cũ
  useEffect(() => {
    setExpandedDebtId(null);
  }, [currentPage]);

  const handleToggleExpand = (debtId: number) => {
    if (expandedDebtId === debtId) {
      // Đóng lại
      setExpandedDebtId(null);
    } else {
      // Mở dòng mới
      setExpandedDebtId(debtId);
      // Lazy-load: chỉ fetch khi chưa có dữ liệu hoặc đã thất bại
      const cached = paymentsByDebtId[debtId];
      if (!cached || cached.status === 'idle' || cached.status === 'failed') {
        dispatch(fetchDebtPayments(debtId));
      }
    }
  };

  const startIndex = (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(currentPage * 10, totalElements);

  // Export CSV (dùng data hiện tại trên trang)
  const handleExportCSV = () => {
    const headers = ['Ngày tạo', 'Tiêu đề', 'Đối tác', 'Tổng nợ', 'Còn lại', 'Loại nợ', 'Trạng thái'];
    const rows = debts.map((d) => [
      formatDate(d.debtDate),
      d.title ?? '',
      d.partnerName ?? '',
      d.totalAmount,
      d.remainingAmount ?? '',
      d.debtType,
      d.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
    ]);
    const csv = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', 'Báo cáo nợ - Equity Ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="debt-table-section" className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.02)] pt-6 font-sans select-none overflow-hidden">
      {/* Toolbar */}
      <div id="table-toolbar" className="px-6 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#f1f5f9]">
        <div>
          <h4 className="text-sm font-extrabold text-[#0f172a] font-display tracking-tight flex items-center gap-2">
            <span>Sổ theo dõi công nợ</span>
            <span className="text-[10px] font-mono text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full font-normal">
              {totalElements} Khoản
            </span>
          </h4>
        </div>
        <div id="toolbar-actions" className="flex items-center gap-3">
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

      {/* Table */}
      <div id="table-scroll-container" className="overflow-x-auto">
        <table id="debt-data-table" className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10px] font-mono tracking-widest text-[#64748b] uppercase border-b border-[#eaecf0]">
              <th className="w-[4%] py-4 px-2 font-semibold text-center" aria-label="Mở rộng" />
              <th className="w-[10%] py-4 px-4 font-semibold text-center">NGÀY TẠO</th>
              <th className="w-[10%] py-4 px-4 font-semibold text-center text-[#d91c1c]">HẠN CHÓT</th>
              <th className="w-[14%] py-4 px-4 font-semibold text-center">TIÊU ĐỀ</th>
              <th className="w-[12%] py-4 px-4 font-semibold text-center">ĐỐI TÁC</th>
              <th className="w-[11%] py-4 px-4 font-semibold text-center">CÒN LẠI</th>
              <th className="w-[11%] py-4 px-4 font-semibold text-center">TỔNG NỢ</th>
              <th className="w-[10%] py-4 px-4 font-semibold text-center">LOẠI NỢ</th>
              <th className="w-[10%] py-4 px-4 font-semibold text-center">TRẠNG THÁI</th>
              <th className="w-[8%] py-4 px-4 font-semibold text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {debts.length > 0 ? (
              debts.map((debt) => {
                const isExpanded = expandedDebtId === debt.id;
                const cached = debt.id != null ? paymentsByDebtId[debt.id] : undefined;

                return (
                  <>
                    {/* ── Dòng chính ────────────────────────────────────────── */}
                    <tr
                      key={`row-${debt.id}`}
                      id={`row-debt-${debt.id}`}
                      className={`group transition-all duration-150 ${isExpanded ? 'bg-[#f8f9ff]' : 'hover:bg-[#f8f9fb]/60'}`}
                    >
                      {/* Chevron toggle */}
                      <td className="py-4 px-2 text-center">
                        <button
                          id={`btn-expand-debt-${debt.id}`}
                          title={isExpanded ? 'Thu gọn giao dịch' : 'Xem giao dịch thanh toán'}
                          onClick={() => debt.id != null && handleToggleExpand(debt.id)}
                          className={`p-1 rounded-lg transition-all cursor-pointer ${
                            isExpanded
                              ? 'bg-[#003178]/10 text-[#003178]'
                              : 'text-[#94a3b8] hover:bg-[#e2e8f0] hover:text-[#475569]'
                          }`}
                        >
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Ngày tạo */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-[13px] font-medium text-[#64748b]">
                          {formatDate(debt.debtDate)}
                        </span>
                      </td>

                      {/* Hạn chót */}
                      <td className="py-4 px-4 text-center">
                        <span className={`text-[13px] font-bold ${debt.dueDate ? (new Date(debt.dueDate) < new Date() && !debt.isPaid ? 'text-[#d91c1c]' : 'text-[#64748b]') : 'text-[#94a3b8]'}`}>
                          {debt.dueDate ? formatDate(debt.dueDate) : '—'}
                        </span>
                      </td>

                      {/* Tiêu đề */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-[13px] font-bold text-[#0f172a] truncate max-w-[120px] block mx-auto">
                          {debt.title || `#${debt.id}`}
                        </span>
                      </td>

                      {/* Đối tác */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-[13px] font-semibold text-[#475569] truncate max-w-[110px] block mx-auto">
                          {debt.partnerName ?? '—'}
                        </span>
                      </td>

                      {/* Còn lại */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-[14px] font-extrabold text-[#0f172a] tracking-tight">
                          {formatVND(debt.isPaid ? 0 : (debt.remainingAmount ?? debt.totalAmount))}
                        </span>
                      </td>

                      {/* Tổng nợ */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-[14px] font-semibold text-[#475569]">
                          {formatVND(debt.totalAmount)}
                        </span>
                      </td>

                      {/* Loại nợ */}
                      <td className="py-4 px-4 text-center">
                        <DebtTypeBadge type={debt.debtType} />
                      </td>

                      {/* Trạng thái */}
                      <td className="py-4 px-4 text-center">
                        <PaymentBadge isPaid={debt.isPaid} remainingAmount={debt.remainingAmount} />
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            id={`btn-view-debt-${debt.id}`}
                            title="Xem chi tiết"
                            onClick={() => onViewDetails(debt)}
                            className="p-1.5 hover:bg-[#eff6ff] rounded-lg text-[#3b82f6] hover:text-[#1d4ed8] transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-edit-debt-${debt.id}`}
                            title="Chỉnh sửa"
                            onClick={() => onEditDebt(debt)}
                            className="p-1.5 hover:bg-[#f0fdf4] rounded-lg text-[#22c55e] hover:text-[#16a34a] transition-all cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {!debt.isPaid && (
                            <button
                              id={`btn-pay-debt-${debt.id}`}
                              title="Đánh dấu đã trả"
                              onClick={() => debt.id != null && onMarkAsPaid(debt.id)}
                              className="p-1.5 hover:bg-[#f0fdf4] rounded-lg text-[#10b981] hover:text-[#059669] transition-all cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            id={`btn-delete-debt-${debt.id}`}
                            title="Xóa"
                            onClick={() => debt.id != null && onDeleteDebt(debt.id)}
                            className="p-1.5 hover:bg-[#fee2e2] rounded-lg text-[#ef4444] hover:text-[#b91c1c] transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Sub-row: danh sách giao dịch thanh toán ───────────── */}
                    {isExpanded && (
                      <tr
                        key={`payments-${debt.id}`}
                        id={`subrow-payments-${debt.id}`}
                        className="bg-gradient-to-r from-[#f0f4ff]/80 to-[#f8f9ff]/60"
                      >
                        <td colSpan={10} className="px-6 pb-4 pt-3">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-2">
                            <ReceiptText className="w-3.5 h-3.5 text-[#003178]" />
                            <span className="text-[10px] font-mono font-semibold tracking-widest text-[#003178] uppercase">
                              Lịch sử giao dịch thanh toán
                            </span>
                          </div>

                          {/* Payments list (via shared component) */}
                          <DebtPaymentsList
                            payments={cached?.data ?? []}
                            status={cached?.status ?? 'loading'}
                            error={cached?.error}
                            compact
                            onRetry={() => debt.id != null && dispatch(fetchDebtPayments(debt.id))}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="py-12 text-center">
                  <p className="text-sm text-[#94a3b8] font-medium">Không tìm thấy khoản nợ nào.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div id="table-pagination" className="px-6 py-4 bg-[#f8f9fb]/50 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748b] font-medium">
            Hiển thị{' '}
            <span className="font-semibold text-[#0f172a]">{totalElements > 0 ? startIndex : 0}</span>
            –
            <span className="font-semibold text-[#0f172a]">{endIndex}</span>{' '}
            trong{' '}
            <span className="font-semibold text-[#0f172a]">{totalElements}</span> khoản nợ
          </p>
          <div id="pagination-controls" className="flex items-center gap-1.5">
            <button
              id="btn-prev-page"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 border border-[#e2e8f0] rounded-lg hover:bg-white text-[#64748b] disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                id={`btn-page-${page}`}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  currentPage === page
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
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 border border-[#e2e8f0] rounded-lg hover:bg-white text-[#64748b] disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
