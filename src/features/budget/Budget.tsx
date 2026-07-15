import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import BudgetsTab from './BudgetsTab';
import FundModal from './FundModal';
import type { Fund, Transaction } from './types';
import { INITIAL_TRANSACTIONS } from './data';
import { HelpCircle, Sparkles, X, ShieldCheck } from 'lucide-react';
import { Sidebar } from '../../component/Sidebar';
import Header from '../../component/Header';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchFunds,
  createFund,
  updateFund,
  deleteFund,
  fetchTotalBalance,
  resetSubmitStatus,
} from '../../store/slices/fundSlice';
import { mapFundToRequest } from './apiTypes';

export default function Budget() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: funds, status, submitStatus, error } = useSelector((state: RootState) => state.fund);
  // RBAC: chỉ Admin (role=1) mới quản lý được quỹ
  const currentRole = useSelector((state: RootState) => state.auth.role);
  const isAdmin = currentRole === 1;

  const [currentTab, setCurrentTab] = useState<string>('budgets'); // Matches screenshot default view "Budgets" active state
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [searchText, setSearchText] = useState<string>('');

  // Modals visibility states
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);

  // Custom overlays visibility
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Load danh sách quỹ khi mount hoặc khi status = 'idle'
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchFunds({ page: 1, size: 50, sortBy: 'name', sortDir: 'asc' }));
      dispatch(fetchTotalBalance());
    }
  }, [status, dispatch]);

  // Thông báo kết quả submit (create/update)
  useEffect(() => {
    if (submitStatus === 'succeeded') {
      toast.success('Lưu nguồn tiền thành công!');
      dispatch(resetSubmitStatus());
    } else if (submitStatus === 'failed' && error) {
      toast.error(error);
      dispatch(resetSubmitStatus());
    }
  }, [submitStatus, error, dispatch]);

  // Computed Notifications list (derived dynamically from the state)
  const systemNotifications = useMemo(() => {
    const list: Array<{ id: string; title: string; message: string; date: string; type: string }> = [];

    // Low balance warnings
    funds.forEach(f => {
      const ratio = f.totalCapital > 0 ? (f.availableBalance / f.totalCapital) : 0;
      if (ratio < 0.1 && f.status === 'INACTIVE') {
        list.push({
          id: `notif-limit-${f.id}`,
          title: `⚠️ Hạn mức rủi ro chạm biên`,
          message: `Nguồn quỹ "${f.name}" chỉ còn khả dụng ${(ratio * 100).toFixed(1)}% (${f.availableBalance.toLocaleString('de-DE')}$)`,
          date: new Date().toISOString(),
          type: 'warning'
        });
      }
    });

    // Strategy pending confirmations
    funds.forEach(f => {
      if (f.status === 'PENDING') {
        list.push({
          id: `notif-pending-${f.id}`,
          title: `🕒 Chờ kích hoạt đối tác`,
          message: `Ngân sách "${f.name}" cần được xác minh biểu mẫu số 12 trước khi thực hiện giải ngân.`,
          date: new Date().toISOString(),
          type: 'info'
        });
      }
    });

    return list;
  }, [funds]);

  // Handler: Add or update a fund — dispatch Redux action
  const handleSaveFund = async (savedFund: Omit<Fund, 'id' | 'updatedAt'> & { id?: string }) => {
    const request = mapFundToRequest(savedFund);
    // Áp dụng toUpperCase cho code trước khi gửi API
    if (request.code) request.code = request.code.toUpperCase();

    if (savedFund.id) {
      // Cập nhật quỹ đã có
      await dispatch(updateFund({ id: Number(savedFund.id), data: request }));
    } else {
      // Tạo quỹ mới
      await dispatch(createFund(request));
    }
    setEditingFund(null);
  };

  // Handler: Delete fund — dispatch Redux action
  const handleDeleteFund = async (id: string) => {
    await dispatch(deleteFund(Number(id)));
    toast.success('Đã xóa nguồn tiền!');
    // Prune local transactions để giữ UI nhất quán
    setTransactions(prev => prev.filter(t => t.fundId !== id));
  };

  // Handler: Trigger edit modal
  const handleOpenEditFund = (fund: Fund) => {
    setEditingFund(fund);
    setIsFundModalOpen(true);
  };



  // Reset to static data (chỉ reset transactions vì funds từ Redux)
  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCurrentTab('budgets');
  };


  return (
    <div className="flex h-screen w-screen bg-brand-bg-alt overflow-hidden select-none" id="applet-main-canvas">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Frame content zone */}
      <div className="flex-1 flex flex-col overflow-hidden" id="workspace-primary-frame">
        {/* Header bar utilities */}
        <Header showSearch={false} />

        {/* Tab switcher */}
        {currentTab === 'budgets' && (
          <BudgetsTab
            funds={funds}
            isLoading={status === 'loading'}
            error={status === 'failed' ? (error ?? 'Đã xảy ra lỗi') : null}
            onOpenAddFund={() => {
              setEditingFund(null);
              setIsFundModalOpen(true);
            }}
            onOpenEditFund={handleOpenEditFund}
            onDeleteFund={handleDeleteFund}
            searchText={searchText}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Fund Modal */}
      <FundModal
        isOpen={isFundModalOpen}
        onClose={() => {
          setIsFundModalOpen(false);
          setEditingFund(null);
        }}
        onSave={handleSaveFund}
        editingFund={editingFund}
      />

      {/* Side-drawer panel: Notifications/Alerts */}
      {notificationsOpen && (
        <>
          <div
            id="notifications-backdrop"
            className="fixed inset-0 bg-[#001945]/30 backdrop-blur-xs z-50 transition-all"
            onClick={() => setNotificationsOpen(false)}
          />
          <div
            id="notifications-drawer"
            className="fixed right-0 top-0 h-screen w-96 bg-white shadow-[0_0_50px_rgba(0,0,0,0.15)] p-6 z-50 flex flex-col font-sans"
          >
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100" id="drawer-notif-title">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h3 className="font-heading font-extrabold text-slate-800 text-sm uppercase tracking-wider">Cảnh báo Vận hành ({systemNotifications.length})</h3>
              </div>
              <button
                id="btn-close-notif-drawer"
                onClick={() => setNotificationsOpen(false)}
                className="p-1 hover:bg-slate-50 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3" id="drawer-notif-body">
              {systemNotifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-1" id="no-notif-div">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2" />
                  <span className="text-xs font-semibold text-slate-500">Hệ thống an toàn tuyệt đối</span>
                  <span className="text-[10px] text-slate-400 text-center px-4">Không có rủi ro kiệt thanh khoản hoặc lệch quỹ kế toán cần phê duyệt khẩn.</span>
                </div>
              ) : (
                systemNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border border-transparent flex flex-col gap-1 ${n.type === 'warning' ? 'bg-rose-50/50' : 'bg-indigo-50/40'
                      }`}
                  >
                    <span className={`text-[11px] font-bold ${n.type === 'warning' ? 'text-rose-700' : 'text-indigo-700'
                      }`}>{n.title}</span>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1 font-sans">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-2 font-mono">Timestamp: UTC {new Date(n.date).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4 text-center" id="notif-drawer-footer">
              <span className="text-[10px] text-slate-400 font-sans">
                Ấn phím "Esc" hoặc nhấn ngoài vùng để tắt cửa sổ này.
              </span>
            </div>
          </div>
        </>
      )}

      {/* Side-drawer panel: Help Center & Documentation */}
      {helpOpen && (
        <>
          <div
            id="help-backdrop"
            className="fixed inset-0 bg-[#001945]/30 backdrop-blur-xs z-50 transition-all"
            onClick={() => setHelpOpen(false)}
          />
          <div
            id="help-drawer"
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-[0_0_50px_rgba(0,0,0,0.15)] p-8 z-50 flex flex-col font-sans overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100" id="help-drawer-title">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-brand-primary" />
                <h3 className="font-heading font-extrabold text-slate-800 text-sm uppercase tracking-wider">Help Center & Ledger Docs</h3>
              </div>
              <button
                id="btn-close-help"
                onClick={() => setHelpOpen(false)}
                className="p-1 hover:bg-slate-50 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-6" id="help-drawer-body">
              {/* Introduction */}
              <div className="p-4 bg-blue-50/50 rounded-xl flex flex-col gap-2" id="intro-box">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Architectural Ledger v1.2</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">
                  Chào mừng tới <strong>Architectural Ledger</strong>, công cụ vận hành vốn doanh nghiệp thuộc lớp thiết kế <em>The Precise Monolith</em>. Ứng dụng cung cấp bảng quản trị cấu trúc vốn tối ưu, đồng bộ dòng tiền tức thời và bảo vệ quỹ an toàn tuyệt đối.
                </p>
              </div>

              {/* Guide 1 */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-heading mb-2">1. Quy trình Nhập / Sửa nguồn quỹ</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans mb-2">
                  Để kiến tạo hoặc điều chỉnh đại lượng vốn của một Quỹ (Internal, Loan, Grant), bạn nhấn nút <strong>"Thêm Nguồn tiền Mới"</strong> hoặc kích hoạt biểu tượng bút chì bên cạnh dòng vốn đó trong bảng Budgets.
                </p>
                <ul className="list-disc list-inside text-xs text-slate-500 flex flex-col gap-1 pl-1">
                  <li><strong>Tổng vốn:</strong> Tổng hạn mức cấp cố định.</li>
                  <li><strong>Số dư khả dụng:</strong> Tiền tồn ví thực tế sẵn sàng giải ngân.</li>
                </ul>
              </div>

              {/* Guide 2 */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-heading mb-2">2. Quản lý Giao dịch & Chuyển Quỹ</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans mb-2">
                  Khi phát sinh thanh toán, hãy lựa chọn hành động <strong>"New Entry"</strong> ở góc dưới thanh menu:
                </p>
                <div className="p-3 bg-slate-50 rounded-lg flex flex-col gap-1.5 mt-2" id="tx-help-cases">
                  <div className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className="text-emerald-500">↑</span>
                    <span><strong>Cấp vốn:</strong> Bơm dòng tiền nhàn rỗi làm gia tăng số khả dụng thực tế của Quỹ đó.</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className="text-rose-400">↓</span>
                    <span><strong>Giải ngân:</strong> Ghi âm tiền rút ra phục vụ dự án. Số dư sẽ tự giảm trừ.</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className="text-indigo-400">⇄</span>
                    <span><strong>Chuyển quỹ:</strong> Chuyển tiền trung gian giữa 2 nguồn vốn độc lập, giữ nguyên định quy mô.</span>
                  </div>
                </div>
              </div>

              {/* Guide 3 */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-heading mb-2">3. Chỉ số Cảnh báo & Rủi ro</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Hệ thống tự động kích hoạt cảnh báo thâm hụt cao cấp độ <em>Warning Status</em> màu đỏ cho các nguồn vốn khi số khả dụng giảm dưới 10% (hoặc ngưỡng tuỳ chọn trong thẻ Settings). Hãy kiểm soát đòn bẩy bằng trang Reports để tối ưu hoá lợi thế doanh nghiệp.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 text-center" id="help-drawer-footer">
              <span className="text-[10px] text-slate-400 font-sans">
                Cung cấp bởi Architectural Systems Inc. Phiên bản bảo mật Enterprise Tier.
              </span>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
