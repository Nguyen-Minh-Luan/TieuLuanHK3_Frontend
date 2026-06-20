import React, { useState, useEffect } from 'react';
import type { SidebarTab, Debt } from './types';
import { INITIAL_DEBTS } from './data';
import DashboardView from './DashboardView';
import ReportsView from './ReportsView';
import BudgetsView from './BudgetsView';
import SettingsView from './SettingsView';
import DebtDetailsModal from './DebtDetailsModal';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import NewDebtModal from './NewDebtModal';
import { Sidebar } from '../../component/Sidebar';

const LOCAL_STORAGE_KEY = 'equity_ledger_debts_db_v1';

export default function DebtPage() {
  // 1. Navigation general state
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');

  // 2. Main debts database state
  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading debts from localStorage', e);
      }
    }
    return INITIAL_DEBTS;
  });

  // Sync to localstorage on edits
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(debts));
  }, [debts]);

  // 3. Search input state
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 4. Modal dialogs toggles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [selectedDetailsDebt, setSelectedDetailsDebt] = useState<Debt | null>(null);

  // 5. Toast Feedback Notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Close toast automatically after 4.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Operational Actions:

  // A. Add/Modify Debt
  const handleSaveDebt = (submittedData: Omit<Debt, 'id'> & { id?: string }) => {
    if (submittedData.id) {
      // Modify mode
      setDebts(prev => prev.map(d => {
        if (d.id === submittedData.id) {
          return { ...d, ...submittedData } as Debt;
        }
        return d;
      }));
      triggerToast('Đã lưu thay đổi cho phiếu nợ thành công!', 'success');
    } else {
      // Creation mode
      const newDebtItem: Debt = {
        ...submittedData,
        id: `debt-${Date.now()}`,
      };
      setDebts(prev => [newDebtItem, ...prev]);
      triggerToast('Đã khởi tạo và đính kèm khoản nợ mới thành công!', 'success');
    }
    setIsModalOpen(false);
    setEditingDebt(null);
  };

  // B. Pay-off Debt
  const handleMarkAsPaid = (id: string) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, status: 'Paid' as const };
      }
      return d;
    }));

    const TargetDebt = debts.find(d => d.id === id);
    const creditorName = TargetDebt ? TargetDebt.creditor : 'Chủ nợ';
    triggerToast(`Đã chuyển tiền thanh toán dứt điểm nghĩa vụ nợ cho ${creditorName}!`, 'success');
  };

  // C. Delete Debt
  const handleDeleteDebt = (id: string) => {
    const target = debts.find(d => d.id === id);
    const creditorName = target ? target.creditor : 'Khoản nợ';

    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn khoản nợ của ${creditorName} khỏi công cụ lưu trữ không?`)) {
      setDebts(prev => prev.filter(d => d.id !== id));
      triggerToast('Đã xóa bỏ hoàn toàn phiếu nợ khỏi sổ lưu trữ!', 'info');
    }
  };

  // D. Set editing data and open modal
  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
  };

  // E. Reset database to pure mockup
  const handleResetDataToOriginal = () => {
    setDebts(INITIAL_DEBTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setActiveTab('dashboard');
  };

  return (
    <div id="app-root-container" className="flex min-h-screen bg-[#f8f9fb] text-[#0f172a] selection:bg-[#003178]/10 select-none font-sans relative antialiased">

      {/* Visual Floating Toast system */}
      {toast && (
        <div
          id="toast-notification"
          className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-[#e2e8f0] py-3.5 px-5 rounded-2xl shadow-xl transition-all duration-300 animate-[slideDown_0.2s_ease-out]"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#3b82f6]" />
          )}
          <span className="text-xs font-bold text-[#0f172a] font-sans">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-[#f1f5f9] rounded-lg text-[#94a3b8] hover:text-[#0f172a] transition-all ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar Navigation - Left anchor */}
      <Sidebar />

      {/* Main content display Area - Right anchor */}
      <main id="app-main-content-well" className="flex-1 flex flex-col min-w-0">

        {/* Render selected view module */}
        {(activeTab === 'dashboard' || activeTab === 'debt') && (
          <DashboardView
            debts={debts}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onMarkAsPaid={handleMarkAsPaid}
            onDeleteDebt={handleDeleteDebt}
            onEditDebt={handleEditDebt}
            onViewDetails={setSelectedDetailsDebt}
            onNewEntryClick={() => {
              setEditingDebt(null);
              setIsModalOpen(true);
            }}
          />
        )}

        {/* Transactions Tab - Shares dashboard parameters but opens with a long pre-filtered search focus */}
        {activeTab === 'transactions' && (
          <DashboardView
            debts={debts}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onMarkAsPaid={handleMarkAsPaid}
            onDeleteDebt={handleDeleteDebt}
            onEditDebt={handleEditDebt}
            onViewDetails={setSelectedDetailsDebt}
            onNewEntryClick={() => {
              setEditingDebt(null);
              setIsModalOpen(true);
            }}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView debts={debts} />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView debts={debts} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            onResetData={handleResetDataToOriginal}
            onShowNotification={(msg) => triggerToast(msg, 'success')}
          />
        )}
      </main>

      {/* A. Modal dialog - Create & Edit popup */}
      <NewDebtModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDebt(null);
        }}
        onSave={handleSaveDebt}
        editDebtData={editingDebt}
      />

      {/* B. Modal dialog - View details specs popup */}
      <DebtDetailsModal
        debt={selectedDetailsDebt}
        onClose={() => setSelectedDetailsDebt(null)}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </div>
  );
}
