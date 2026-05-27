/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Settings as SettingsIcon,
  Menu,
  Home,
  Receipt,
  BarChart3,
  AlertCircle,
  Plus,
} from "lucide-react";

import type { Transaction, ViewType } from "./types";
import { INITIAL_TRANSACTIONS } from "./data";
import TransactionModal from "./TransactionModal";
import TransactionsView from "./TransactionsView";
import DashboardView from "./DashboardView";
import ReportsView from "./ReportsView";
import BudgetsView from "./BudgetsView";
import SettingsView from "./SettingsView";
import { Sidebar } from "../../component/Sidebar";
import Header from "../../component/Header";

export default function TransactionPage() {
  // Master state with LocalStorage recovery
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("executive_ledger_txns");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Lỗi phân tích dữ liệu lịch sử transactions", e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Persist master list state
  useEffect(() => {
    localStorage.setItem("executive_ledger_txns", JSON.stringify(transactions));
  }, [transactions]);

  // View router
  const [currentView, setView] = useState<ViewType>("Transactions");

  // Edit/Add overlay modal trigger
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // System parameters
  const [companyName, setCompanyName] = useState("Architectural Ledger");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountsSearch, setAccountsSearch] = useState("");

  // Notifications drawer simulation
  const [unreadCount, setUnreadCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      text: "Hạn mức chi tiêu Procurement vượt ngưỡng 80%",
      time: "10 phút trước",
      unread: true,
    },
    {
      id: 2,
      text: "Giao dịch AWS Enterprise Subscription thất bại (Failed)",
      time: "2 giờ trước",
      unread: true,
    },
    {
      id: 3,
      text: "Báo cáo tài chính quý Q3 đã sẵn sàng tải về",
      time: "1 ngày trước",
      unread: true,
    },
  ]);

  const handleCreateOrUpdateTx = (
    txData: Omit<Transaction, "id"> & { id?: string },
  ) => {
    if (txData.id) {
      // Modify existing
      setTransactions(
        transactions.map((t) =>
          t.id === txData.id ? ({ ...t, ...txData } as Transaction) : t,
        ),
      );
    } else {
      // Create fresh
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        ...txData,
      } as Transaction;
      setTransactions([newTx, ...transactions]);

      // Add a notification about new transaction if it is critical
      if (newTx.overSpending === "Critical") {
        const newNotice = {
          id: Date.now(),
          text: `Vượt chi nghiêm trọng (Critical): "${newTx.description}" - $${Math.abs(newTx.amount).toLocaleString()}`,
          time: "Vừa xong",
          unread: true,
        };
        setAlerts([newNotice, ...alerts]);
        setUnreadCount((c) => c + 1);
      }
    }
  };

  const handleDeleteTx = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleEditIntent = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleNewEntryIntent = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleLogoutSimulate = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi Ledger Pro?")) {
      localStorage.removeItem("executive_ledger_txns");
      setTransactions(INITIAL_TRANSACTIONS);
      setView("Transactions");
      alert("Đã xóa dữ liệu cục bộ và khôi phục cài đặt gốc thành công!");
    }
  };

  // Render correct nested component view
  const renderCurrentViewContents = () => {
    switch (currentView) {
      case "Dashboard":
        return (
          <DashboardView
            transactions={transactions}
            onNavigateToTxns={() => setView("Transactions")}
          />
        );
      case "Transactions":
        return (
          <TransactionsView
            transactions={transactions}
            onEditTransaction={handleEditIntent}
            onDeleteTransaction={handleDeleteTx}
            onNewEntryClick={handleNewEntryIntent}
          />
        );
      case "Reports":
        return <ReportsView transactions={transactions} />;
      case "Budgets":
        return <BudgetsView transactions={transactions} />;
      case "Settings":
        return (
          <SettingsView
            companyName={companyName}
            setCompanyName={setCompanyName}
          />
        );
      default:
        return (
          <TransactionsView
            transactions={transactions}
            onEditTransaction={handleEditIntent}
            onDeleteTransaction={handleDeleteTx}
            onNewEntryClick={handleNewEntryIntent}
          />
        );
    }
  };

  const handleClearNotifications = () => {
    setAlerts(alerts.map((a) => ({ ...a, unread: false })));
    setUnreadCount(0);
  };

  return (
    <div className="bg-slate-50 font-body text-slate-800 min-h-screen flex w-full relative">
      {/* SideNavBar panel */}
      <Sidebar />
      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative pb-20 md:pb-8">
        {/* Sticky top desktop bar */}
        <Header />

        {/* Dynamic Nested Screen Component */}
        <div className="p-6 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          {renderCurrentViewContents()}
        </div>

        {/* Bottom Mobile sticky navigation bar layout */}
        <nav
          id="mobile-navigation-bar"
          className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-4 z-40 shadow-lg"
        >
          <button
            onClick={() => setView("Dashboard")}
            className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${currentView === "Dashboard" ? "text-primary font-bold" : "text-slate-400 hover:text-slate-700"}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">
              Home
            </span>
          </button>

          <button
            onClick={() => setView("Transactions")}
            className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${currentView === "Transactions" ? "text-primary font-bold" : "text-slate-400 hover:text-slate-700"}`}
          >
            <Receipt className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">
              Txns
            </span>
          </button>

          {/* Floating plus toggle */}
          <div className="relative -top-3.5">
            <button
              onClick={handleNewEntryIntent}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary-container text-white shadow-xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer border-4 border-white"
            >
              <Plus className="h-6 w-6 font-bold" />
            </button>
          </div>

          <button
            onClick={() => setView("Reports")}
            className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${currentView === "Reports" ? "text-primary font-bold" : "text-slate-400 hover:text-slate-700"}`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">
              Stats
            </span>
          </button>

          <button
            onClick={() => setView("Settings")}
            className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${currentView === "Settings" ? "text-primary font-bold" : "text-slate-400 hover:text-slate-700"}`}
          >
            <SettingsIcon className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">
              More
            </span>
          </button>
        </nav>
      </main>

      {/* Popup transaction creator Form modal overlay overlay */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdateTx}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
