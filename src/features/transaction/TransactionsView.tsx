/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Building2,
  Coins,
  ShieldCheck,
  CloudOff,
  Network,
  HelpCircle,
  MoreVertical,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Bell,
} from "lucide-react";
import type { Transaction } from "./types";
import { useNavigate } from "react-router-dom";

import type { FetchParams } from "../../services/transactionService";
import { useEffect } from "react";
import { useAppSelector } from "../../hooks/useAppDispatch";
import { useDebounce } from "../../hooks/useDebounce";
import { canCreateTransaction, canEditTransaction } from "../../lib/permissions";
import { formatVND } from "../../utils/formatCurrency";

interface TransactionsViewProps {
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
  onNewEntryClick: () => void;
  onCheckWarningClick?: () => void;
  params: FetchParams;
  setParams: React.Dispatch<React.SetStateAction<FetchParams>>;
  totalPages: number;
  totalElements: number;
  status?: "idle" | "loading" | "succeeded" | "failed";
  /** Search state lifted from parent (TransactionPage) and controlled by shared Header */
  localSearch: string;
  setLocalSearch: React.Dispatch<React.SetStateAction<string>>;
  /** Role của user hiện tại (từ Redux store) — dùng cho RBAC UI */
  currentUserRole?: number | null;
  /** ID của user hiện tại — dùng kiểm tra ownership phiếu */
  currentUserId?: number | null;
}

export default function TransactionsView({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  onNewEntryClick,
  onCheckWarningClick,
  params,
  setParams,
  totalPages,
  totalElements,
  status,
  localSearch,
  setLocalSearch,
  currentUserRole,
  currentUserId,
}: TransactionsViewProps) {
  const navigate = useNavigate();

  // RBAC: tính quyền tạo phiếu
  const showCreateButton = canCreateTransaction(currentUserRole ?? null);

  // Sync params.keyword back to parent's localSearch when changed externally
  useEffect(() => {
    if ((params.keyword || "") !== localSearch) {
      setLocalSearch(params.keyword || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.keyword]);

  const debouncedKeyword = useDebounce(localSearch, 300);

  useEffect(() => {
    setParams((prev) => {
      const currentKeyword = prev.keyword || "";
      const trimmedDebounced = debouncedKeyword.trim();
      if (currentKeyword === trimmedDebounced) return prev;
      return {
        ...prev,
        keyword: trimmedDebounced || undefined,
        page: 1,
      };
    });
  }, [debouncedKeyword, setParams]);

  // Categories list loaded dynamically from Redux
  const categoriesList = useAppSelector((state) => state.category.items);

  // Active action menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const sortField = params.sortBy === "transaction_date" ? "date" : params.sortBy === "amount" ? "amount" : "";
  const sortOrder = params.sortDir || "desc";

  const dateRangeValue = useMemo(() => {
    if (params.fromDate === "2023-10-01" && params.toDate === "2023-10-31") return "OctOnly";
    if (params.fromDate === "2023-09-01" && params.toDate === "2023-09-30") return "SepOnly";
    return "All";
  }, [params.fromDate, params.toDate]);

  const getIconComponent = (
    iconName: Transaction["icon"],
    _category?: string,
  ) => {
    switch (iconName) {
      case "building":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/10 text-primary",
          icon: <Building2 className="h-5 w-5" />,
        };
      case "payment":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600",
          icon: <Coins className="h-5 w-5" />,
        };
      case "maintenance":
        return {
          bg: "bg-amber-50 dark:bg-amber-900/10 text-amber-600",
          icon: <ShieldCheck className="h-5 w-5" />,
        };
      case "cloud":
        return {
          bg: "bg-rose-50 dark:bg-rose-900/10 text-rose-500",
          icon: <CloudOff className="h-5 w-5" />,
        };
      case "payroll":
        return {
          bg: "bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600",
          icon: <Network className="h-5 w-5" />,
        };
      default:
        return {
          bg: "bg-slate-50 dark:bg-slate-800 text-slate-600",
          icon: <FileSpreadsheet className="h-5 w-5" />,
        };
    }
  };

  const getCategoryTheme = (cat: string) => {
    const catUpper = cat.toUpperCase();
    if (catUpper.includes("PROCUR")) {
      return "bg-blue-100/50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    } else if (catUpper.includes("REVEN")) {
      return "bg-emerald-100/50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
    } else if (catUpper.includes("MAINTEN")) {
      return "bg-amber-100/50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
    } else if (catUpper.includes("INFRA") || catUpper.includes("CLOUD")) {
      return "bg-rose-100/40 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300";
    } else if (catUpper.includes("HR") || catUpper.includes("PAYROLL")) {
      return "bg-violet-100/50 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300";
    }
    return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
  };

  const getOverspendingTheme = (os: Transaction["overSpending"]) => {
    switch (os) {
      case "Critical":
        return " text-rose-700  dark:text-rose-600";
      case "Warning":
        return " text-amber-800  dark:text-amber-600";
      case "Fine":
        return " text-emerald-800 dark:text-emerald-600";
    }
  };

  const getStatusComponent = (st: Transaction["status"]) => {
    switch (st) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold  text-emerald-800  dark:text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Hoạt động
          </span>
        );
      case "UPDATED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-800 dark:text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            Đã cập nhật
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-rose-800 dark:text-rose-600">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  // Transactions are already fully filtered, sorted, and paginated by backend
  const paginatedTransactions = transactions;
  const activePage = params.page || 1;
  const itemsPerPage = params.size || 10;

  // Toggle backend sorting state parameters
  const handleSort = (field: "date" | "amount") => {
    const backendSortBy = field === "date" ? "transaction_date" : "amount";
    const nextDir = params.sortBy === backendSortBy && params.sortDir === "desc" ? "asc" : "desc";
    setParams((prev) => ({
      ...prev,
      sortBy: backendSortBy,
      sortDir: nextDir,
      page: 1,
    }));
  };

  return (
    <div className="w-full">
      {/* Page Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex text-xs font-semibold text-slate-400 mb-2 space-x-2 select-none">
            <span className="hover:text-primary cursor-pointer transition-colors">
              Main
            </span>
            <span>/</span>
            <span className="text-primary font-bold">Transactions</span>
          </nav>
          <h3 className="text-3xl font-extrabold text-blue-900 font-headline tracking-tight">
            Transaction Management
          </h3>
          <p className="text-slate-500 mt-1 font-body text-sm">
            Monitor and audit all enterprise-level financial movements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="transactions-check-warning-cta"
            onClick={onCheckWarningClick}
            title="Kiểm tra cảnh báo chi tiêu theo danh mục"
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-600 hover:text-amber-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            Kiểm tra cảnh báo
          </button>
          {showCreateButton && (
            <button
              id="transactions-new-entry-cta"
              onClick={onNewEntryClick}
              className="flex items-center bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg active:scale-95 group transition-all duration-200 cursor-pointer text-center"
            >
              <span className="mr-2 text-md font-bold group-hover:rotate-90 transition-transform duration-300">
                +
              </span>
              Tạo Giao dịch
            </button>
          )}
        </div>
      </div>

      {/* Bento-style filters section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 w-full">
        {/* Category breakdown filter */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-1 shadow-xs border border-slate-200/50 flex items-center justify-between group transition-colors">
          <div className="relative w-full flex items-center justify-between">
            <select
              value={params.categoryId || ""}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                setParams((prev) => ({
                  ...prev,
                  categoryId: val,
                  page: 1,
                }));
              }}
              className="w-full bg-transparent border-none outline-hidden focus:outline-hidden text-sm py-3 px-3 text-slate-700 font-bold appearance-none cursor-pointer pr-8"
            >
              <option value="">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Status code filter */}
        <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-1 shadow-xs border border-slate-200/50 flex items-center justify-between group transition-colors">
          <div className="relative w-full flex items-center justify-between">
            <select
              value={params.status || ""}
              onChange={(e) => {
                const val = e.target.value || undefined;
                setParams((prev) => ({
                  ...prev,
                  status: val,
                  page: 1,
                }));
              }}
              className="w-full bg-transparent border-none outline-hidden focus:outline-hidden text-sm py-3 px-3 text-slate-700 font-bold appearance-none cursor-pointer pr-8"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="UPDATED">Đã cập nhật</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
            <ChevronDown className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Date Filter */}
        <div className="md:col-span-3 bg-surface-container-lowest rounded-xl p-1 shadow-xs border border-slate-200/50 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors">
          <div className="relative w-full flex items-center pr-3">
            <Calendar className="ml-3 h-5 w-5 text-slate-400 shrink-0" />
            <div className="w-full">
              <select
                value={dateRangeValue}
                onChange={(e) => {
                  const val = e.target.value;
                  let fromDate: string | undefined = undefined;
                  let toDate: string | undefined = undefined;
                  if (val === "OctOnly") {
                    fromDate = "2023-10-01";
                    toDate = "2023-10-31";
                  } else if (val === "SepOnly") {
                    fromDate = "2023-09-01";
                    toDate = "2023-09-30";
                  }
                  setParams((prev) => ({
                    ...prev,
                    fromDate,
                    toDate,
                    page: 1,
                  }));
                }}
                className="w-full bg-transparent border-none outline-hidden focus:outline-hidden text-[13px] text-slate-800 font-bold py-2 px-2 appearance-none cursor-pointer"
              >
                <option value="All">All Dates (2023)</option>
                <option value="OctOnly">Oct 01 - Oct 31, 2023</option>
                <option value="SepOnly">Sep 01 - Sep 30, 2023</option>
              </select>
            </div>
            <ChevronDown className="absolute right-1.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main transactions data table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-slate-200/50 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-full font-body">
            <colgroup>
              <col className="w-[140px]" />
              <col className="w-[320px]" />
              <col className="w-[160px]" />
              <col className="w-[160px]" />
              <col className="w-[140px]" />
              <col className="w-[120px]" />
              <col className="w-[80px]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100">
                <th
                  onClick={() => handleSort("date")}
                  className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors select-none text-left"
                >
                  <div className="flex items-center gap-1">
                    Ngày giao dịch{" "}
                    {sortField === "date" && (sortOrder === "desc" ? "↓" : "↑")}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline whitespace-nowrap select-none text-left">
                  Mô tả / Mã GD
                </th>
                <th className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline whitespace-nowrap select-none text-left">
                  Danh mục
                </th>
                <th
                  onClick={() => handleSort("amount")}
                  className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline text-right whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    Số tiền{" "}
                    {sortField === "amount" &&
                      (sortOrder === "desc" ? "↓" : "↑")}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline text-center whitespace-nowrap select-none">
                  Mức vượt chi
                </th>
                <th className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline text-center whitespace-nowrap select-none">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline text-center whitespace-nowrap select-none">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {status === "loading" && paginatedTransactions.length === 0 ? (
                // Loading skeleton rows shown on initial load
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4.5">
                        <div className="h-3 bg-slate-200 rounded w-20 mb-1" />
                        <div className="h-2 bg-slate-100 rounded w-14" />
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                          <div>
                            <div className="h-3 bg-slate-200 rounded w-36 mb-1" />
                            <div className="h-2 bg-slate-100 rounded w-24" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5"><div className="h-5 bg-slate-200 rounded-full w-20" /></td>
                      <td className="px-6 py-4.5 text-right"><div className="h-3 bg-slate-200 rounded w-16 ml-auto" /></td>
                      <td className="px-6 py-4.5 text-center"><div className="h-5 bg-slate-100 rounded-full w-14 mx-auto" /></td>
                      <td className="px-6 py-4.5 text-center"><div className="h-5 bg-slate-200 rounded-full w-20 mx-auto" /></td>
                      <td className="px-6 py-4.5 text-center"><div className="h-5 bg-slate-100 rounded w-6 mx-auto" /></td>
                    </tr>
                  ))}
                </>
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => {
                  const iconStyle = getIconComponent(tx.icon, tx.category);
                  return (
                    <tr
                      key={tx.id}
                      id={`tx-row-${tx.id}`}
                      onClick={() => navigate(`/transactions/${tx.id}`)}
                      className={`hover:bg-slate-50/80 transition-colors group align-middle cursor-pointer ${tx.overSpending === 'Critical'
                        ? 'bg-rose-50/40 dark:bg-rose-950/10'
                        : tx.overSpending === 'Warning'
                          ? 'bg-amber-50/40 dark:bg-amber-950/10'
                          : ''
                        }`}
                    >
                      {/* Date details */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex flex-col tabular-nums">
                          <span className="text-sm font-bold text-slate-800">
                            {tx.date}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {tx.time}
                          </span>
                        </div>
                      </td>

                      {/* Description with colored category icon */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center min-w-[240px]">
                          <div
                            className={`w-10 h-10 rounded-full ${iconStyle.bg} flex items-center justify-center mr-3 shrink-0`}
                          >
                            {iconStyle.icon}
                          </div>
                          <div className="min-w-0">
                            <span
                              className="text-sm font-semibold text-slate-800 block truncate"
                              title={tx.description}
                            >
                              {tx.description}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono font-medium block">
                              Mã: {tx.refId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category Pill Tag */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getCategoryTheme(tx.category)}`}
                        >
                          {tx.category}
                        </span>
                      </td>

                      {/* Financial Amount Value (color-flagged) */}
                      <td className="px-6 py-4.5 text-right whitespace-nowrap font-mono">
                        <span
                          className={`text-sm font-bold inline-flex items-center gap-1 ${tx.amount < 0 ? "text-red-500" : "text-emerald-600"
                            }`}
                        >
                          {tx.amount < 0 ? (
                            <>
                              <span>▼</span>
                              <span>
                                -{formatVND(Math.abs(tx.amount))}
                              </span>
                            </>
                          ) : (
                            <>
                              <span>▲</span>
                              <span>
                                +{formatVND(tx.amount)}
                              </span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Overspending Severity Rating */}
                      <td className="px-6 py-4.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${getOverspendingTheme(tx.overSpending)}`}
                        >
                          {tx.overSpending}
                        </span>
                      </td>

                      {/* Status Tag */}
                      <td className="px-6 py-4.5 text-center whitespace-nowrap">
                        {getStatusComponent(tx.status)}
                      </td>

                      {/* Actions Popover menu — chỉ hiện nếu có ít nhất 1 action khả dụng */}
                      {(() => {
                        const txUserId = (tx as any).userId as number | undefined;
                        const canEdit = canEditTransaction(currentUserRole ?? null, txUserId, currentUserId ?? null);
                        const canDelete = canEditTransaction(currentUserRole ?? null, txUserId, currentUserId ?? null);
                        if (!canEdit && !canDelete) return null;
                        return (
                          <td className="px-6 py-4.5 text-center whitespace-nowrap relative" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-block text-left">
                              <button
                                onClick={() =>
                                  setActiveMenuId(
                                    activeMenuId === tx.id ? null : tx.id,
                                  )
                                }
                                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              >
                                <MoreVertical className="h-5 w-5" />
                              </button>

                              {/* Floating items action dropdown */}
                              {activeMenuId === tx.id && (
                                <>
                                  <div
                                    onClick={() => setActiveMenuId(null)}
                                    className="fixed inset-0 z-10"
                                  />
                                  <div className="absolute right-12 top-0 mt-2 w-36 rounded-xl bg-white border border-slate-100 shadow-xl ring-2 ring-black/5 z-20 overflow-hidden divide-y divide-slate-50">
                                    {canEdit && (
                                      <button
                                        onClick={() => {
                                          onEditTransaction(tx);
                                          setActiveMenuId(null);
                                        }}
                                        className="w-full flex items-center px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left gap-2 cursor-pointer"
                                      >
                                        <Edit2 className="h-4 w-4 text-blue-600" />
                                        Edit Record
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button
                                        onClick={() => {
                                          onDeleteTransaction(tx);
                                          setActiveMenuId(null);
                                        }}
                                        className="w-full flex items-center px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left gap-2 cursor-pointer"
                                      >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                        Hủy giao dịch
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        );
                      })()}
                    </tr>
                  );
                })
              ) : status === "loading" ? (
                // Loading skeleton rows
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4.5">
                        <div className="h-3 bg-slate-200 rounded w-20 mb-1" />
                        <div className="h-2 bg-slate-100 rounded w-14" />
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                          <div>
                            <div className="h-3 bg-slate-200 rounded w-36 mb-1" />
                            <div className="h-2 bg-slate-100 rounded w-24" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5"><div className="h-5 bg-slate-200 rounded-full w-20" /></td>
                      <td className="px-6 py-4.5 text-right"><div className="h-3 bg-slate-200 rounded w-16 ml-auto" /></td>
                      <td className="px-6 py-4.5 text-center"><div className="h-5 bg-slate-100 rounded-full w-14 mx-auto" /></td>
                      <td className="px-6 py-4.5 text-center"><div className="h-5 bg-slate-200 rounded-full w-20 mx-auto" /></td>
                      <td className="px-6 py-4.5 text-center"><div className="h-5 bg-slate-100 rounded w-6 mx-auto" /></td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 px-6">
                    <div className="max-w-md mx-auto text-slate-400 py-6 flex flex-col items-center gap-2">
                      <HelpCircle className="h-10 w-10 text-slate-300 animate-pulse" />
                      <span className="text-sm font-semibold text-slate-600 block">
                        Không tìm thấy giao dịch nào
                      </span>
                      <span className="text-xs text-slate-500 block">
                        Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc danh
                        mục/trạng thái khác.
                      </span>
                      <button
                        onClick={() => {
                          setLocalSearch("");
                          setParams((prev) => ({
                            ...prev,
                            keyword: undefined,
                            categoryId: undefined,
                            status: undefined,
                            fromDate: undefined,
                            toDate: undefined,
                            page: 1,
                          }));
                        }}
                        className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Reset bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer with active pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <div className="text-xs font-semibold text-slate-500">
            Showing{" "}
            <span className="font-extrabold text-blue-900">
              {totalElements > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} -{" "}
              {Math.min(activePage * itemsPerPage, totalElements)}
            </span>{" "}
            of <span className="font-bold text-slate-700">{totalElements}</span>{" "}
            results
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setParams((p) => ({ ...p, page: Math.max((p.page || 1) - 1, 1) }))}
              disabled={activePage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-150 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isSelected = activePage === pageNum;
                // Simple paginator windowing
                if (
                  totalPages > 6 &&
                  pageNum > 3 &&
                  pageNum < totalPages - 1 &&
                  Math.abs(pageNum - activePage) > 1
                ) {
                  if (pageNum === 4 && activePage > 4) {
                    return (
                      <span
                        key={pageNum}
                        className="px-1 text-slate-400 select-none text-xs self-center"
                      >
                        ...
                      </span>
                    );
                  }
                  if (
                    pageNum === totalPages - 2 &&
                    activePage < totalPages - 3
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="px-1 text-slate-400 select-none text-xs self-center"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setParams((p) => ({ ...p, page: pageNum }))}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${isSelected
                      ? "bg-primary text-white"
                      : "hover:bg-slate-200/60 text-slate-600"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setParams((p) => ({ ...p, page: Math.min((p.page || 1) + 1, totalPages) }))}
              disabled={activePage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-150 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
