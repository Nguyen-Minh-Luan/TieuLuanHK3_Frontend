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
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  FileSpreadsheet,
} from "lucide-react";
import type { Transaction } from "./types";
import { CATEGORIES, STATUSES } from "./data";
import { Link } from "react-router-dom";

interface TransactionsViewProps {
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onNewEntryClick: () => void;
}

export default function TransactionsView({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  onNewEntryClick,
}: TransactionsViewProps) {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedDateRange, setSelectedDateRange] = useState("All"); // October only vs All

  // Sorting state
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Active action menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getIconComponent = (
    iconName: Transaction["icon"],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    category: string,
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
    switch (cat) {
      case "Procurement":
        return "bg-blue-100/50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Revenue":
        return "bg-emerald-100/50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
      case "Maintenance":
        return "bg-amber-100/50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
      case "Infrastructure":
        return "bg-rose-100/40 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300";
      case "HR & Payroll":
        return "bg-violet-100/50 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getOverspendingTheme = (os: Transaction["overSpending"]) => {
    switch (os) {
      case "Critical":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
      case "Warning":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/25 dark:text-amber-300";
      case "Fine":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/25 dark:text-emerald-300";
    }
  };

  const getStatusComponent = (st: Transaction["status"]) => {
    switch (st) {
      case "Completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Completed
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            Pending
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
            Failed
          </span>
        );
    }
  };

  // Process rows by searching, filtering, and sorting
  const processedTransactions = useMemo(() => {
    let result = [...transactions];

    // Search query matches
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.refId.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    }

    // Category matches
    if (selectedCategory !== "All Categories") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Status matches
    if (selectedStatus !== "All Status") {
      result = result.filter((t) => t.status === selectedStatus);
    }

    // Date range filtering
    if (selectedDateRange === "OctOnly") {
      result = result.filter((t) => t.date.includes("Oct"));
    } else if (selectedDateRange === "SepOnly") {
      result = result.filter((t) => t.date.includes("Sep"));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortField === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
      }
    });

    return result;
  }, [
    transactions,
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedDateRange,
    sortField,
    sortOrder,
  ]);

  // Adjust pagination if page index exceeds calculated boundaries
  const totalItems = processedTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const paginatedTransactions = useMemo(() => {
    const startIdx = (activePage - 1) * itemsPerPage;
    return processedTransactions.slice(startIdx, startIdx + itemsPerPage);
  }, [processedTransactions, activePage]);

  // Toggle dynamic column sorts
  const handleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
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
      </div>

      {/* Bento-style filters section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 w-full">
        {/* Search input field */}
        <div className="md:col-span-5 bg-surface-container-lowest rounded-xl p-1 shadow-xs border border-slate-200/50 flex items-center group focus-within:border-primary/40 transition-colors focus-within:ring-2 focus-within:ring-primary/10">
          <Search className="ml-3 h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page on filter
            }}
            placeholder="Search by description, reference ID, or category..."
            className="w-full bg-transparent border-none outline-hidden focus:outline-hidden text-sm py-3 px-3 text-slate-800 placeholder:text-slate-400 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mr-2 py-1 px-2 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category breakdown filter */}
        <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-1 shadow-xs border border-slate-200/50 flex items-center justify-between group transition-colors">
          <div className="relative w-full flex items-center justify-between">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent border-none outline-hidden focus:outline-hidden text-sm py-3 px-3 text-slate-700 font-bold appearance-none cursor-pointer pr-8"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent border-none outline-hidden focus:outline-hidden text-sm py-3 px-3 text-slate-700 font-bold appearance-none cursor-pointer pr-8"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
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
                value={selectedDateRange}
                onChange={(e) => {
                  setSelectedDateRange(e.target.value);
                  setCurrentPage(1);
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
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100">
                <th
                  onClick={() => handleSort("date")}
                  className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    Date{" "}
                    {sortField === "date" && (sortOrder === "desc" ? "↓" : "↑")}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline whitespace-nowrap select-none">
                  Description
                </th>
                <th className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline whitespace-nowrap select-none">
                  Category
                </th>
                <th
                  onClick={() => handleSort("amount")}
                  className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline text-right whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    Amount{" "}
                    {sortField === "amount" &&
                      (sortOrder === "desc" ? "↓" : "↑")}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline text-right whitespace-nowrap select-none">
                  Over Spending
                </th>
                <th className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline text-center whitespace-nowrap select-none">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-blue-950 uppercase tracking-widest font-headline text-center whitespace-nowrap select-none">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => {
                  const iconStyle = getIconComponent(tx.icon, tx.category);
                  return (
                    <Link
                      key={tx.id}
                      id={`tx-row-${tx.id}`}
                      className="hover:bg-slate-50/50 transition-colors group align-middle" to={"/transactionDetail"}                    >
                      {/* Date details */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex flex-col">
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
                              {tx.refId}
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
                          className={`text-sm font-bold ${tx.amount < 0 ? "text-red-500" : "text-emerald-600"}`}
                        >
                          {tx.amount < 0
                            ? `-$${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : `+$${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </span>
                      </td>

                      {/* Overspending Severity Rating */}
                      <td className="px-6 py-4.5 text-right whitespace-nowrap">
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

                      {/* Actions Popover menu */}
                      <td className="px-6 py-4.5 text-center whitespace-nowrap relative">
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
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Xác nhận xóa giao dịch "${tx.description}"?`,
                                      )
                                    ) {
                                      onDeleteTransaction(tx.id);
                                    }
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left gap-2 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                  Delete Row
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </Link>
                  );
                })
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
                          setSearchTerm("");
                          setSelectedCategory("All Categories");
                          setSelectedStatus("All Status");
                          setSelectedDateRange("All");
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
              {totalItems > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} -{" "}
              {Math.min(activePage * itemsPerPage, totalItems)}
            </span>{" "}
            of <span className="font-bold text-slate-700">{totalItems}</span>{" "}
            results
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                    onClick={() => setCurrentPage(pageNum)}
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
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
