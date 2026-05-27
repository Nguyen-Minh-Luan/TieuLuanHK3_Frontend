/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { INITIAL_TRANSACTIONS } from './data';
import type { Transaction, SidebarTab } from './types';
import TransactionDetails from './TransactionDetails';
import NewEntryModal from './NewEntryModal';
import PrintVoucherModal from './PrintVoucherModal';
import DashboardView from './DashboardView';
import ReportsView from './ReportsView';
import BudgetsView from './BudgetsView';
import SettingsView from './SettingsView';
import { HelpCircle, LogOut, LayoutDashboard, Receipt, BarChart3, Wallet, Settings as SettingsIcon, Plus, X } from 'lucide-react';
import { Sidebar } from '../../component/Sidebar';
import Header from '../../component/Header';

export default function TransactionDetailPage() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_TRANSACTIONS[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isNewEntryOpen, setIsNewEntryOpen] = useState<boolean>(false);
  const [isPrintVoucherOpen, setIsPrintVoucherOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Retrieve active transaction
  const activeTransaction = transactions.find(t => t.id === selectedId) || transactions[0];

  // Handler: Update transaction in real-time local state database
  const handleUpdate = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    alert(`Đã cập nhật thay đổi thành công cho giao dịch ${updated.id}!`);
  };

  // Handler: Cancel payment transaction
  const handleCancel = (id: string) => {
    if (confirm(`Bạn có chắc chắn muốn hủy giao dịch ${id}? Thao tác này sẽ đánh dấu trạng thái giao dịch thành CANCELLED.`)) {
      setTransactions(prev => prev.map(t => {
        if (t.id === id) {
          return {
            ...t,
            status: 'CANCELLED',
            riskStatus: 'RISK (Cảnh báo)'
          };
        }
        return t;
      }));
      alert(`Đã hủy thành công giao dịch ${id}!`);
    }
  };

  // Handler: Add custom new transaction
  const handleCreateNewTx = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
    setSelectedId(newTx.id);
    setActiveTab('transactions');
    alert(`Khoản giao dịch mới với mã ${newTx.id} đã được khởi tạo thành công!`);
  };

  // Count active notifications: we have items that are warning/cancelled as trigger logs
  const notificationsCount = transactions.filter(t => t.status === 'CANCELLED' || t.riskStatus.includes('WARNING')).length;

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#191c1e] relative flex antialiased selection:bg-[#003178]/20 transition-all font-sans">

      {/* 1. Desktop Nav rail (Left column) */}
      <Sidebar />

      {/* 2. Responsive Mobile Sidebar Overlay Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden flex justify-start animate-fade-in">
          <div className="w-64 bg-[#f2f4f6] h-full p-4 relative flex flex-col justify-between">
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#737783] hover:text-[#003178] hover:bg-[#eceef0] rounded-xl cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-8 mt-4">
              <div className="px-2">
                <h1 className="font-headline font-extrabold text-[#003178] text-lg tracking-tight">Equity Ledger</h1>
                <p className="text-[10px] text-[#737783] font-bold tracking-widest uppercase mt-0.5">Corporate Finance</p>
              </div>

              <nav className="space-y-1.5">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'transactions', label: 'Transactions', icon: Receipt },
                  { id: 'reports', label: 'Reports', icon: BarChart3 },
                  { id: 'budgets', label: 'Budgets', icon: Wallet },
                  { id: 'settings', label: 'Settings', icon: SettingsIcon },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as SidebarTab);
                        setIsMobileNavOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left cursor-pointer ${isActive
                        ? 'text-[#003178] font-bold bg-[#e6e8ea]'
                        : 'text-[#434652] hover:bg-[#eceef0]'
                        }`}
                    >
                      <Icon size={18} />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  setIsNewEntryOpen(true);
                }}
                className="w-full primary-gradient text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 shadow cursor-pointer text-xs"
              >
                <Plus size={16} />
                <span>New Entry</span>
              </button>
            </div>

            <div className="space-y-1 border-t border-[#c3c6d4]/20 pt-4 mt-auto">
              <button
                onClick={() => { alert("Vui lòng email đến support@equityledger.vn"); setIsMobileNavOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#434652]"
              >
                <HelpCircle size={16} />
                <span>Support</span>
              </button>
              <button
                onClick={() => { alert("Đang đăng xuất"); setIsMobileNavOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#434652]"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Canvas Section */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* Core Header stickiness */}
        <Header />

        {/* Content viewport area */}
        <main className="p-6 md:p-10 max-w-7xl w-full mx-auto flex-1">
          {activeTab === 'transactions' && (
            <div className="w-full">
              {/* Right Column Section: In-depth metrics panel */}
              {activeTransaction ? (
                <TransactionDetails
                  transaction={activeTransaction}
                  onUpdate={handleUpdate}
                  onCancel={handleCancel}
                  onPrintClick={() => setIsPrintVoucherOpen(true)}
                  transactions={transactions}
                  onSelectTransaction={(id) => setSelectedId(id)}
                />
              ) : (
                <div className="bg-white border border-[#eceef0] rounded-xl p-12 text-center text-sm text-[#737783]">
                  Chưa có giao dịch nào khả dụng. Vui lòng tạo giao dịch mới!
                </div>
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              onSelectTx={(id) => setSelectedId(id)}
              onNavigateToTxTab={() => setActiveTab('transactions')}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'budgets' && <BudgetsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* 4. Overlay Forms Modals */}
      <NewEntryModal
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
        onSubmit={handleCreateNewTx}
      />

      {activeTransaction && (
        <PrintVoucherModal
          isOpen={isPrintVoucherOpen}
          transaction={activeTransaction}
          onClose={() => setIsPrintVoucherOpen(false)}
        />
      )}

    </div>
  );
}
