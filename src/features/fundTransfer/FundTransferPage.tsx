import React, { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw, ArrowRightLeft, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchFunds } from '../../store/slices/fundSlice';
import { fundTransferService } from '../../services/fundTransferService';
import type { FundTransferDTO } from './apiTypes';
import FundTransferHistoryTable from './FundTransferHistoryTable';
import FundTransferFormModal from './FundTransferFormModal';
import Header from '../../component/Header';
import { Sidebar } from '../../component/Sidebar';

export default function FundTransferPage() {
  const dispatch = useAppDispatch();
  const { role } = useAppSelector((state) => state.auth);
  const { items: funds, status: fundStatus } = useAppSelector((state) => state.fund);
  const fundsLoading = fundStatus === 'loading';
  const [data, setData] = useState<FundTransferDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [filterFundId, setFilterFundId] = useState<number | ''>('');
  const [filterDates, setFilterDates] = useState<{ from: string; to: string }>({ from: '', to: '' });

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Quyền: 1 = Admin, 3 = Thủ quỹ -> được tạo lệnh chuyển. Tổng hợp (4) chỉ xem.
  const canManage = role === 1 || role === 3;

  useEffect(() => {
    dispatch(fetchFunds({ page: 1, size: 100 }));
  }, [dispatch]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fundTransferService.getTransferHistory({
        page,
        size,
        fundId: filterFundId ? Number(filterFundId) : undefined,
        fromDate: filterDates.from || undefined,
        toDate: filterDates.to || undefined,
      });
      setData(response.content);
      setTotal(response.totalElements);
    } catch (error) {
      triggerToast('Lỗi khi tải lịch sử chuyển quỹ', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, size, filterFundId, filterDates]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePageChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  const triggerToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const handleTransferSuccess = (msg: string) => {
    setIsModalVisible(false);
    triggerToast(msg, 'success');
    loadData();
    // Tải lại danh sách quỹ để cập nhật số dư mới nhất
    dispatch(fetchFunds({ page: 1, size: 100 }));
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fb] font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <div className="flex-1 px-8 py-8 space-y-8 overflow-y-auto">
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#003178]/10 rounded-2xl">
                <ArrowRightLeft className="w-8 h-8 text-[#003178]" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-extrabold text-[#0f172a] tracking-tight">
                  Lịch sử chuyển quỹ
                </h2>
                <p className="text-sm text-[#64748b] font-medium mt-1">
                  Quản lý và theo dõi lịch sử luân chuyển tiền giữa các quỹ
                </p>
              </div>
            </div>

            {canManage && (
              <button
                onClick={() => setIsModalVisible(true)}
                className="bg-gradient-to-r from-[#003178] to-[#0d47a1] hover:from-[#002255] hover:to-[#0a3881] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>Chuyển quỹ</span>
              </button>
            )}
          </div>

          {/* Filters section */}
          <div className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.02)] border border-[#e2e8f0]/40 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Lọc theo quỹ
              </label>
              <select
                value={filterFundId}
                onChange={(e) => {
                  setFilterFundId(e.target.value === '' ? '' : Number(e.target.value));
                  setPage(1);
                }}
                className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 h-11 rounded-xl transition-all outline-none cursor-pointer"
                disabled={fundsLoading}
              >
                <option value="">Tất cả quỹ</option>
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Từ ngày
              </label>
              <input
                type="date"
                value={filterDates.from}
                onChange={(e) => {
                  setFilterDates({ ...filterDates, from: e.target.value });
                  setPage(1);
                }}
                className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 h-11 rounded-xl transition-all outline-none"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Đến ngày
              </label>
              <input
                type="date"
                value={filterDates.to}
                onChange={(e) => {
                  setFilterDates({ ...filterDates, to: e.target.value });
                  setPage(1);
                }}
                className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 h-11 rounded-xl transition-all outline-none"
              />
            </div>

            <button
              onClick={() => {
                setFilterFundId('');
                setFilterDates({ from: '', to: '' });
                setPage(1);
              }}
              className="h-11 px-5 border border-[#e2e8f0] hover:bg-[#f1f5f9] text-[#475569] hover:text-[#0f172a] rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
              title="Làm mới bộ lọc"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Làm mới</span>
            </button>
          </div>

          {/* Table section */}
          <FundTransferHistoryTable
            data={data}
            loading={loading}
            total={total}
            currentPage={page}
            pageSize={size}
            onPageChange={handlePageChange}
          />
        </div>
      </main>

      {/* Modal */}
      <FundTransferFormModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleTransferSuccess}
        onError={(msg) => triggerToast(msg, 'error')}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-slide-in-right">
          <div className="bg-white rounded-xl shadow-2xl p-4 min-w-[320px] border border-[#e2e8f0]/40 flex items-start gap-3">
            {toast.type === 'success' ? (
              <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            ) : (
              <div className="p-2 bg-red-50 rounded-lg shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            )}
            <div className="flex-1 mt-0.5">
              <h4 className={`text-sm font-bold ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                {toast.type === 'success' ? 'Thành công' : 'Lỗi'}
              </h4>
              <p className="text-xs text-[#64748b] font-medium mt-1">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-[#f1f5f9] rounded-md text-[#94a3b8] transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
