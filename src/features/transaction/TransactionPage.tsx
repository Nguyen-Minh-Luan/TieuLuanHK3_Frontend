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
import { useTransactions } from "./useTransactions";
import type { TransactionRequest, TransactionResponse, SpendingWarning } from "./apiTypes";
import apiClient from "../../services/apiClient";
import TransactionModal from "./TransactionModal";
import TransactionsView from "./TransactionsView";
import DashboardView from "./DashboardView";
import ReportsView from "./ReportsView";
import BudgetsView from "./BudgetsView";
import SettingsView from "./SettingsView";
import { Sidebar } from "../../component/Sidebar";
import Header from "../../component/Header";

export default function TransactionPage() {
  const [currentView, setView] = useState<ViewType>("Transactions");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // System parameters
  const [companyName, setCompanyName] = useState("Architectural Ledger");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountsSearch, setAccountsSearch] = useState("");

  // Dynamic Categories and Funds state
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [funds, setFunds] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    apiClient.get("/categories?size=100")
      .then((res) => setCategories(res.data.data.content || []))
      .catch((err) => console.error("Error loading categories", err));

    apiClient.get("/funds?size=100")
      .then((res) => setFunds(res.data.data.content || []))
      .catch((err) => console.error("Error loading funds", err));
  }, []);

  const categoriesMap = useMemo(() => {
    const map: Record<number, string> = {};
    categories.forEach((c) => {
      if (c.id) map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const fundsMap = useMemo(() => {
    const map: Record<number, string> = {};
    funds.forEach((f) => {
      if (f.id) map[f.id] = f.name;
    });
    return map;
  }, [funds]);

  // Hook for backend API transaction synchronization
  const {
    transactions: rawTransactions,
    totalPages,
    totalElements,
    loading,
    error,
    params,
    setParams,
    create,
    update,
    cancel,
  } = useTransactions({
    page: 1,
    size: currentView === "Transactions" ? 10 : 1000,
  });

  // Dynamically change request limit size based on active view tab
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      size: currentView === "Transactions" ? 10 : 1000,
    }));
  }, [currentView, setParams]);

  // Map backend response format to client-friendly UI interface structures
  const mapResponseToTransaction = useCallback((tx: TransactionResponse): Transaction => {
    const categoryName = categoriesMap[tx.categoryId] || "Procurement";
    const isExpense = tx.type === "EXPENSE" || tx.type === "EXPENSE_DEBT";
    const amount = isExpense ? -Math.abs(tx.amount) : Math.abs(tx.amount);

    let overSpending: "Critical" | "Warning" | "Fine" = "Fine";
    if (tx.hasWarning) {
      overSpending = "Critical";
    } else {
      const mag = Math.abs(amount);
      if (isExpense) {
        if (mag >= 10000) overSpending = "Critical";
        else if (mag >= 2000) overSpending = "Warning";
      }
    }

    let status: "Completed" | "Pending" | "Failed" = "Completed";
    if (tx.status === "ACTIVE") status = "Completed";
    else if (tx.status === "UPDATED") status = "Pending";
    else if (tx.status === "CANCELLED") status = "Failed";

    let icon: Transaction["icon"] = "other";
    const catUpper = categoryName.toUpperCase();
    if (catUpper.includes("PROCUR")) icon = "building";
    else if (catUpper.includes("REVEN")) icon = "payment";
    else if (catUpper.includes("MAINTEN")) icon = "maintenance";
    else if (catUpper.includes("INFRA") || catUpper.includes("CLOUD")) icon = "cloud";
    else if (catUpper.includes("HR") || catUpper.includes("PAYROLL")) icon = "payroll";

    let dateStr = tx.transactionDate;
    let timeStr = "";
    try {
      const d = new Date(tx.transactionDate);
      if (!isNaN(d.getTime())) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        dateStr = `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
        
        let hours = d.getHours();
        const mins = String(d.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        timeStr = `${String(hours).padStart(2, "0")}:${mins} ${ampm}`;
      }
    } catch (e) {
      console.error(e);
    }

    // Extended transaction properties to preserve database keys for updates
    return {
      id: String(tx.id),
      date: dateStr,
      time: timeStr,
      description: tx.note || "Giao dịch không tên",
      refId: tx.transactionCode || `TXN-${tx.id}`,
      category: categoryName,
      amount,
      overSpending,
      status,
      icon,
      // Metadata fields for edit mode pre-fill
      categoryId: tx.categoryId,
      fundId: tx.fundId,
      partnerId: tx.partnerId,
      debtId: tx.debtId,
      rawNote: tx.note,
      rawType: tx.type,
    } as any;
  }, [categoriesMap]);

  const transactions = useMemo(() => {
    return rawTransactions.map(mapResponseToTransaction);
  }, [rawTransactions, mapResponseToTransaction]);

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

  // Visual Floating Toast feedback state
  const [toast, setToast] = useState<{
    type: "success" | "warning" | "error";
    title: string;
    message: string;
    detail?: string;
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 8500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showWarningToast = (warning: SpendingWarning) => {
    const isCritical = warning.level === "CRITICAL";
    setToast({
      type: isCritical ? "error" : "warning",
      title: isCritical ? "⚠️ Chi tiêu bất thường nghiêm trọng!" : "⚠️ Vượt mức chi tiêu bình thường",
      message: warning.message,
      detail: `Tháng này: ${warning.currentMonthTotal.toLocaleString()} đ\nTB lịch sử: ${warning.historicalAverage.toLocaleString()} đ\nVượt: +${warning.overagePercent.toFixed(1)}%`,
    });
  };

  const handleCreateOrUpdateTx = async (formData: any) => {
    try {
      if (editingTransaction) {
        await update(Number(editingTransaction.id), formData as TransactionRequest);
        setToast({
          type: "success",
          title: "Thao tác thành công",
          message: "Đã cập nhật giao dịch thành công!",
        });
      } else {
        const result = await create(formData as TransactionRequest);
        const warning = result.data.warning;
        if (warning && warning.hasWarning) {
          showWarningToast(warning);
        } else {
          setToast({
            type: "success",
            title: "Thao tác thành công",
            message: "Đã tạo giao dịch mới thành công!",
          });
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setToast({
        type: "error",
        title: "Lưu giao dịch thất bại",
        message: err?.response?.data?.message || err?.message || "Lỗi lưu giao dịch",
      });
    }
  };

  const handleDeleteTx = async (id: string) => {
    try {
      await cancel(Number(id));
      setToast({
        type: "success",
        title: "Thao tác thành công",
        message: "Đã hủy giao dịch và hoàn tiền thành công!",
      });
    } catch (err: any) {
      setToast({
        type: "error",
        title: "Hủy giao dịch thất bại",
        message: err?.response?.data?.message || err?.message || "Không thể hủy giao dịch này.",
      });
    }
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
            params={params}
            setParams={setParams}
            totalPages={totalPages}
            totalElements={totalElements}
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
            params={params}
            setParams={setParams}
            totalPages={totalPages}
            totalElements={totalElements}
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
        categories={categories}
        funds={funds}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          id="toast-notification"
          className={`fixed top-6 right-6 z-[120] max-w-sm rounded-2xl shadow-2xl p-4 border flex flex-col gap-1 transition-all duration-300 animate-slide-in-right ${
            toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-950"
              : toast.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-950"
              : "bg-emerald-50 border-emerald-200 text-emerald-950"
          }`}
        >
          <div className="flex justify-between items-start gap-4">
            <span className="font-extrabold text-sm flex items-center gap-1.5">
              {toast.title}
            </span>
            <button
              onClick={() => setToast(null)}
              className="text-xs opacity-60 hover:opacity-100 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs font-semibold opacity-90">{toast.message}</p>
          {toast.detail && (
            <p className="text-[10px] opacity-75 font-mono whitespace-pre-line mt-1 border-t border-slate-200/40 pt-1">
              {toast.detail}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
