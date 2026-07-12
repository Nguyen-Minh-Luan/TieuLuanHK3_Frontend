import React from 'react';
import type { FundTransferDTO } from './apiTypes';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, Inbox, ArrowRight } from 'lucide-react';

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

interface Props {
  data: FundTransferDTO[];
  loading: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'SUCCESS') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        SUCCESS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
      <XCircle className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

export default function FundTransferHistoryTable({
  data,
  loading,
  total,
  currentPage,
  pageSize,
  onPageChange,
}: Props) {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.02)] overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10px] font-mono tracking-widest text-[#64748b] uppercase border-b border-[#eaecf0]">
              <th className="py-4 px-5 font-semibold">MÃ PHIẾU</th>
              <th className="py-4 px-5 font-semibold">THỜI GIAN</th>
              <th className="py-4 px-5 font-semibold">GIAO DỊCH</th>
              <th className="py-4 px-5 font-semibold text-right">SỐ TIỀN</th>
              <th className="py-4 px-5 font-semibold">LÝ DO</th>
              <th className="py-4 px-5 font-semibold text-center">TRẠNG THÁI</th>
              <th className="py-4 px-5 font-semibold">NGƯỜI THỰC HIỆN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-5"><div className="h-4 bg-[#f1f5f9] rounded w-24" /></td>
                  <td className="py-4 px-5"><div className="h-4 bg-[#f1f5f9] rounded w-32" /></td>
                  <td className="py-4 px-5"><div className="h-4 bg-[#f1f5f9] rounded w-48" /></td>
                  <td className="py-4 px-5 flex justify-end"><div className="h-4 bg-[#f1f5f9] rounded w-28" /></td>
                  <td className="py-4 px-5"><div className="h-4 bg-[#f1f5f9] rounded w-40" /></td>
                  <td className="py-4 px-5"><div className="h-6 bg-[#f1f5f9] rounded-full w-24 mx-auto" /></td>
                  <td className="py-4 px-5"><div className="h-4 bg-[#f1f5f9] rounded w-32" /></td>
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8f9fb]/60 group transition-all duration-150">
                  <td className="py-4 px-5 text-sm font-semibold text-[#0f172a]">{item.transferCode}</td>
                  <td className="py-4 px-5 text-sm text-[#475569]">{formatDate(item.createdAt)}</td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2 text-sm text-[#0f172a] font-medium">
                      <span>{item.fromFundName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                      <span>{item.toFundName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm font-bold text-emerald-600 text-right">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}
                  </td>
                  <td className="py-4 px-5 text-sm text-[#475569] max-w-[200px] truncate" title={item.reason}>
                    {item.reason}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-4 px-5 text-sm text-[#475569]">{item.createdByName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <Inbox className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
                  <p className="text-sm text-[#94a3b8] font-medium">Không có giao dịch chuyển quỹ nào.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="px-6 py-4 bg-[#f8f9fb]/50 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748b] font-medium">
            Hiển thị <span className="font-semibold text-[#0f172a]">{total > 0 ? startIndex : 0}</span>–<span className="font-semibold text-[#0f172a]">{endIndex}</span> trong <span className="font-semibold text-[#0f172a]">{total}</span> giao dịch
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1, pageSize)}
              className="p-1.5 border border-[#e2e8f0] rounded-lg hover:bg-white text-[#64748b] disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {(() => {
              const windowSize = 7;
              const half = Math.floor(windowSize / 2);
              let startPage = Math.max(1, currentPage - half);
              let endPage = Math.min(totalPages, startPage + windowSize - 1);
              startPage = Math.max(1, endPage - windowSize + 1);
              return Array.from(
                { length: endPage - startPage + 1 },
                (_, i) => startPage + i
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page, pageSize)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === page
                    ? 'bg-[#003178] text-white shadow-sm'
                    : 'border border-transparent hover:border-[#e2e8f0] text-[#64748b] hover:bg-white hover:text-[#0f172a]'
                    }`}
                >
                  {page}
                </button>
              ));
            })()}
            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1, pageSize)}
              className="p-1.5 border border-[#e2e8f0] rounded-lg hover:bg-white text-[#64748b] disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
