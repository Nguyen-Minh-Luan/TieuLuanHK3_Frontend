import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle, ArrowRight, Clock, User, FileText, CreditCard } from 'lucide-react';
import { fundTransferService } from '../../services/fundTransferService';
import type { FundTransferDTO } from './apiTypes';

interface Props {
  visible: boolean;
  transferId: number | null;
  onClose: () => void;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'SUCCESS') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
        <CheckCircle2 className="w-4 h-4" />
        SUCCESS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
      <XCircle className="w-4 h-4" />
      {status}
    </span>
  );
};

export default function FundTransferDetailModal({ visible, transferId, onClose }: Props) {
  const [data, setData] = useState<FundTransferDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && transferId) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
          const result = await fundTransferService.getTransferById(transferId);
          setData(result);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Không thể tải thông tin chi tiết.');
        } finally {
          setLoading(false);
        }
      };
      loadData();
    } else {
      setData(null);
      setError(null);
    }
  }, [visible, transferId]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#e2e8f0]/40">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9] bg-[#f8f9fb]">
          <h2 className="text-xl font-display font-bold text-[#0f172a]">
            Chi tiết phiếu chuyển quỹ
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748b] hover:bg-white hover:text-[#0f172a] hover:shadow-sm transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-[#f1f5f9] rounded-xl"></div>
              <div className="h-40 bg-[#f1f5f9] rounded-xl"></div>
              <div className="h-32 bg-[#f1f5f9] rounded-xl"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-[#f8f9fb] rounded-xl border border-[#e2e8f0]/50">
                <div>
                  <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">Mã phiếu</p>
                  <p className="text-lg font-bold text-[#0f172a]">{data.transferCode}</p>
                </div>
                <StatusBadge status={data.status} />
              </div>

              {/* Main Transfer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#94a3b8] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#64748b] mb-1">Thời gian tạo</p>
                      <p className="text-sm text-[#0f172a] font-medium">{formatDate(data.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-[#94a3b8] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#64748b] mb-1">Người thực hiện</p>
                      <p className="text-sm text-[#0f172a] font-medium">{data.createdByName}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#64748b] mb-1">Số tiền</p>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(data.amount)}</p>
                      <p className="text-xs text-[#64748b] mt-0.5 italic">{data.amountInWord}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fund Flow */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#003178]"></div>
                <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-4">Luồng chuyển tiền</p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="flex-1 w-full p-4 bg-[#f8f9fb] rounded-xl text-center border border-[#e2e8f0]/50">
                    <p className="text-xs text-[#64748b] mb-1">Từ Quỹ</p>
                    <p className="font-bold text-[#0f172a] mb-2">{data.fromFundName}</p>
                    <p className="text-xs text-[#475569]">Số dư sau: <span className="font-semibold">{formatCurrency(data.fromFundBalanceAfter)}</span></p>
                  </div>

                  <div className="shrink-0 p-2 bg-[#f1f5f9] rounded-full hidden sm:block">
                    <ArrowRight className="w-5 h-5 text-[#64748b]" />
                  </div>

                  <div className="flex-1 w-full p-4 bg-[#f8f9fb] rounded-xl text-center border border-[#e2e8f0]/50">
                    <p className="text-xs text-[#64748b] mb-1">Đến Quỹ</p>
                    <p className="font-bold text-[#0f172a] mb-2">{data.toFundName}</p>
                    <p className="text-xs text-[#475569]">Số dư sau: <span className="font-semibold">{formatCurrency(data.toFundBalanceAfter)}</span></p>
                  </div>
                </div>
              </div>

              {/* Reasons & Notes */}
              <div className="space-y-4 bg-[#f8f9fb] p-5 rounded-xl border border-[#e2e8f0]/50">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[#94a3b8] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#64748b] mb-1">Lý do</p>
                    <p className="text-sm text-[#0f172a]">{data.reason}</p>
                  </div>
                </div>
                
                {data.note && (
                  <div className="flex items-start gap-3 pt-3 border-t border-[#e2e8f0]">
                    <div className="w-5 h-5 shrink-0"></div>
                    <div>
                      <p className="text-xs font-semibold text-[#64748b] mb-1">Ghi chú</p>
                      <p className="text-sm text-[#475569]">{data.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
        
        <div className="px-6 py-4 border-t border-[#f1f5f9] bg-[#f8f9fb] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white border border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-all cursor-pointer shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
