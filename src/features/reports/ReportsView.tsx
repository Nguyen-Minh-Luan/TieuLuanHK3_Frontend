import React, { useState, useEffect, useCallback } from "react";
import {
  FileDown, Plus, Pencil, Trash2, RefreshCw, Search,
  ChevronLeft, ChevronRight, X, Check, AlertCircle,
  TrendingUp, TrendingDown, Scale, Loader2,
  Calendar, ChevronDown, BarChart3,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import {
  fetchReports, createReport, updateReport,
  deleteReport, recalculateReport,
  setParams, resetSubmitStatus,
} from "../../store/slices/reportSlice";
import reportService from "../../services/reportService";
import type {
  ReportResponse, ReportRequest, ReportType, ReportStatus,
} from "./reportTypes";
import { REPORT_TYPE_LABELS, REPORT_STATUS_LABELS } from "./reportTypes";
import { Sidebar } from "../../component/Sidebar";
import Header from "../../component/Header";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n?: number) =>
  (n ?? 0).toLocaleString("vi-VN", { minimumFractionDigits: 0 }) + " ₫";

const fmtDate = (d?: string) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("vi-VN");
};

const toInputDate = (d?: string) => {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color,
}: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex flex-col gap-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400 font-medium">{sub}</p>}
    </div>
  );
}

function ReportTypeBadge({ type }: { type: ReportType }) {
  const colors: Record<ReportType, string> = {
    MONTHLY:   "bg-blue-50 text-blue-700",
    QUARTERLY: "bg-purple-50 text-purple-700",
    YEARLY:    "bg-amber-50 text-amber-700",
    CUSTOM:    "bg-teal-50 text-teal-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${colors[type]}`}>
      {REPORT_TYPE_LABELS[type]}
    </span>
  );
}

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const isPublished = status === "PUBLISHED";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-slate-400"}`} />
      {REPORT_STATUS_LABELS[status]}
    </span>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReportRequest) => Promise<void>;
  editReport: ReportResponse | null;
  userId: number;
}

function ReportFormModal({ isOpen, onClose, onSubmit, editReport, userId }: FormModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReportType>("MONTHLY");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<ReportStatus>("DRAFT");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editReport) {
      setTitle(editReport.title);
      setType(editReport.type);
      setFromDate(toInputDate(editReport.fromDate));
      setToDate(toInputDate(editReport.toDate));
      setNote(editReport.note ?? "");
      setStatus(editReport.status);
    } else {
      setTitle("");
      setType("MONTHLY");
      setFromDate("");
      setToDate("");
      setNote("");
      setStatus("DRAFT");
    }
    setErrorMsg("");
  }, [editReport, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErrorMsg("Vui lòng nhập tiêu đề báo cáo."); return; }
    if (!fromDate) { setErrorMsg("Vui lòng chọn ngày bắt đầu."); return; }
    if (!toDate) { setErrorMsg("Vui lòng chọn ngày kết thúc."); return; }
    if (fromDate > toDate) { setErrorMsg("Ngày bắt đầu phải trước ngày kết thúc."); return; }
    try {
      setIsSubmitting(true);
      setErrorMsg("");
      await onSubmit({ title: title.trim(), type, fromDate, toDate, note: note.trim(), status, createdBy: userId });
      onClose();
    } catch (err: any) {
      setErrorMsg(err ?? "Lỗi xử lý yêu cầu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full bg-surface-container-low border border-surface-container-highest/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-custom/15 outline-none font-sans text-on-surface-custom placeholder-on-surface-variant-custom/60";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            {editReport ? "Chỉnh sửa Báo cáo" : "Tạo Báo cáo mới"}
          </h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2">
            <AlertCircle size={14} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tiêu đề báo cáo</label>
            <input id="rpt-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ví dụ: Báo cáo Tài chính Tháng 6/2026" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Loại báo cáo</label>
              <div className="relative">
                <select id="rpt-type" value={type} onChange={e => setType(e.target.value as ReportType)}
                  className={inputCls + " appearance-none pr-10 cursor-pointer"}>
                  {(Object.keys(REPORT_TYPE_LABELS) as ReportType[]).map(t => (
                    <option key={t} value={t}>{REPORT_TYPE_LABELS[t]}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Trạng thái</label>
              <div className="relative">
                <select id="rpt-status" value={status} onChange={e => setStatus(e.target.value as ReportStatus)}
                  className={inputCls + " appearance-none pr-10 cursor-pointer"}>
                  <option value="DRAFT">Bản nháp</option>
                  <option value="PUBLISHED">Đã phát hành</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Từ ngày</label>
              <input id="rpt-from" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Đến ngày</label>
              <input id="rpt-to" type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ghi chú</label>
            <textarea id="rpt-note" value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder="Ghi chú thêm về báo cáo này..." className={inputCls + " resize-none"} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer">
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting}
              className="primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} className="stroke-[2.5]" />}
              {isSubmitting ? "Đang xử lý..." : editReport ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function ReportDetailPanel({
  report, onClose, onRecalculate, onExportPdf, isRecalculating,
}: {
  report: ReportResponse;
  onClose: () => void;
  onRecalculate: (id: number) => void;
  onExportPdf: (id: number) => void;
  isRecalculating: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">{report.title}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <ReportTypeBadge type={report.type} />
              <ReportStatusBadge status={report.status} />
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-500">
          <div><span className="font-semibold block text-slate-700">Từ ngày</span>{fmtDate(report.fromDate)}</div>
          <div><span className="font-semibold block text-slate-700">Đến ngày</span>{fmtDate(report.toDate)}</div>
          <div><span className="font-semibold block text-slate-700">Người tạo</span>{report.createdByName ?? `#${report.createdBy}`}</div>
          <div><span className="font-semibold block text-slate-700">Ngày tạo</span>{fmtDate(report.createdAt)}</div>
        </div>

        {/* Financial Summary */}
        <div>
          <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Tóm tắt Tài chính</h4>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Tổng thu" value={fmt(report.totalIncome)} color="text-emerald-600" />
            <StatCard label="Tổng chi" value={fmt(report.totalExpense)} color="text-rose-500" />
            <StatCard
              label="Cân đối"
              value={fmt(report.netBalance)}
              color={report.netBalance >= 0 ? "text-blue-700" : "text-rose-600"}
              sub={report.netBalance >= 0 ? "Dương" : "Âm"}
            />
          </div>
        </div>

        {/* Balance Sheet */}
        <div>
          <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Bảng Cân đối Kế toán</h4>
          <div className="rounded-xl border border-slate-200 overflow-hidden text-sm">
            {[
              ["Tiền & Tương đương (110)", report.cashAndEquivalents, report.cashAndEquivalentsBoy],
              ["Nợ phải thu (120)", report.accountsReceivable, report.accountsReceivableBoy],
              ["Tổng tài sản (200)", report.totalAssets, report.totalAssetsBoy],
              ["Nợ phải trả (300)", report.totalLiabilities, report.totalLiabilitiesBoy],
              ["Vốn chủ sở hữu (400)", report.totalEquity, report.totalEquityBoy],
              ["Tổng nguồn vốn (500)", report.totalLiabilitiesAndEquity, report.totalLiabilitiesAndEquityBoy],
            ].map(([label, cur, boy], i) => (
              <div key={i} className={`flex justify-between px-4 py-3 ${i % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
                <span className="text-slate-600 font-medium">{label as string}</span>
                <div className="text-right">
                  <span className="font-bold text-slate-800 block">{fmt(cur as number)}</span>
                  {boy !== undefined && <span className="text-[10px] text-slate-400">Đầu năm: {fmt(boy as number)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {report.note && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-800">
            <span className="font-bold">Ghi chú:</span> {report.note}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => onRecalculate(report.id)}
            disabled={isRecalculating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200 cursor-pointer disabled:opacity-50"
          >
            {isRecalculating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Tái tính số liệu
          </button>
          <button
            onClick={() => onExportPdf(report.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
          >
            <FileDown size={14} />
            Xuất PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ReportsView ─────────────────────────────────────────────────────────

export default function ReportsView() {
  const dispatch = useAppDispatch();
  const { items, totalElements, totalPages, params, status, submitStatus } =
    useAppSelector((s) => s.report);
  const userId = useAppSelector((s) => s.auth.id) ?? 0;

  // Local UI state
  const [searchInput, setSearchInput] = useState(params.keyword ?? "");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editReport, setEditReport] = useState<ReportResponse | null>(null);
  const [detailReport, setDetailReport] = useState<ReportResponse | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastOk, setToastOk] = useState(true);
  const [recalcId, setRecalcId] = useState<number | null>(null);

  const triggerToast = useCallback((msg: string, ok = true) => {
    setToastMsg(msg); setToastOk(ok);
    setTimeout(() => setToastMsg(null), 4500);
  }, []);

  // Debounced keyword search
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.keyword ?? "") !== searchInput)
        dispatch(setParams({ keyword: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, params.keyword, dispatch]);

  // Fetch when idle
  useEffect(() => {
    if (status === "idle") dispatch(fetchReports(params));
  }, [status, params, dispatch]);

  // Handlers
  const handleFormSubmit = async (data: ReportRequest) => {
    if (editReport) {
      await dispatch(updateReport({ id: editReport.id, data })).unwrap();
      triggerToast("Đã cập nhật báo cáo thành công.");
    } else {
      await dispatch(createReport(data)).unwrap();
      triggerToast("Đã tạo báo cáo mới thành công!");
    }
    dispatch(resetSubmitStatus());
  };

  const handleDelete = async (report: ReportResponse) => {
    if (!window.confirm(`Xóa báo cáo "${report.title}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await dispatch(deleteReport(report.id)).unwrap();
      triggerToast(`Đã xóa báo cáo "${report.title}".`);
    } catch (err: any) {
      triggerToast(err ?? "Không thể xóa báo cáo.", false);
    }
  };

  const handleRecalculate = async (id: number) => {
    try {
      setRecalcId(id);
      const updated = await dispatch(recalculateReport(id)).unwrap();
      // Refresh detail panel with updated data
      setDetailReport(updated);
      triggerToast("Đã tái tính số liệu thành công!");
    } catch (err: any) {
      triggerToast(err ?? "Tái tính thất bại.", false);
    } finally {
      setRecalcId(null);
      dispatch(resetSubmitStatus());
    }
  };

  const handleExportPdf = (id: number) => {
    window.open(reportService.exportPdfUrl(id), "_blank");
  };

  const currentPage = params.page ?? 1;

  // ─── Skeleton ───────────────────────────────────────────────────────────────
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
      ))}
    </div>
  );

  // ─── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full bg-surface text-on-surface-custom font-body select-none overflow-hidden">

      {/* SideNavBar Panel */}
      <Sidebar />

      {/* Main Container Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Top Navbar Header */}
        <Header />

        {/* Dynamic Content Switching */}
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          <div className="space-y-6 font-sans">

            {/* Toast */}
            {toastMsg && (
              <div className={`fixed top-6 right-6 z-[120] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all
                ${toastOk ? "bg-slate-900 text-white" : "bg-red-600 text-white"}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center
                  ${toastOk ? "bg-emerald-500/20 text-emerald-400" : "bg-white/20 text-white"}`}>
                  {toastOk ? <Check size={14} className="stroke-[3]" /> : <AlertCircle size={14} />}
                </div>
                <span className="text-xs font-semibold">{toastMsg}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-[#191c1e] tracking-tight">
                  Trung tâm Báo cáo
                </h2>
                <p className="text-slate-500 mt-1 text-sm">
                  Tạo, quản lý và xuất báo cáo tài chính theo kỳ.
                </p>
              </div>
              <button
                id="btn-new-report"
                onClick={() => { setEditReport(null); setIsFormOpen(true); }}
                className="primary-gradient text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer shrink-0"
              >
                <Plus size={16} className="stroke-[2.5]" />
                Tạo Báo cáo mới
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-4 flex flex-wrap items-center gap-3 shadow-sm">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="rpt-search"
                  type="text"
                  placeholder="Tìm kiếm tiêu đề báo cáo..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary-custom/15 transition-all bg-slate-50 text-slate-700"
                />
              </div>

              {/* Type filter */}
              <div className="relative">
                <select
                  id="rpt-filter-type"
                  value={params.type ?? ""}
                  onChange={e => dispatch(setParams({ type: (e.target.value as ReportType) || undefined, page: 1 }))}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary-custom/15 cursor-pointer"
                >
                  <option value="">Tất cả loại</option>
                  {(Object.keys(REPORT_TYPE_LABELS) as ReportType[]).map(t => (
                    <option key={t} value={t}>{REPORT_TYPE_LABELS[t]}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  id="rpt-filter-status"
                  value={params.status ?? ""}
                  onChange={e => dispatch(setParams({ status: (e.target.value as ReportStatus) || undefined, page: 1 }))}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary-custom/15 cursor-pointer"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="DRAFT">Bản nháp</option>
                  <option value="PUBLISHED">Đã phát hành</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* Date range */}
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400 shrink-0" />
                <input type="date" value={params.fromDate ?? ""}
                  onChange={e => dispatch(setParams({ fromDate: e.target.value || undefined, page: 1 }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-custom/15 text-slate-700 cursor-pointer" />
                <span className="text-slate-400 text-xs">—</span>
                <input type="date" value={params.toDate ?? ""}
                  onChange={e => dispatch(setParams({ toDate: e.target.value || undefined, page: 1 }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-custom/15 text-slate-700 cursor-pointer" />
              </div>

              {/* Reset */}
              {(params.keyword || params.type || params.status || params.fromDate || params.toDate) && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    dispatch(setParams({ keyword: undefined, type: undefined, status: undefined, fromDate: undefined, toDate: undefined, page: 1 }));
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Xóa bộ lọc"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Error banner */}
            {status === "failed" && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle size={16} />
                Không thể tải danh sách báo cáo. Kiểm tra kết nối mạng và thử lại.
              </div>
            )}

            {/* Content Area */}
            {status === "loading" && items.length === 0 ? (
              renderSkeleton()
            ) : (
              /* Reports Table */
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/60">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/60">
                        {["Tiêu đề", "Loại", "Kỳ báo cáo", "Thu/Chi/Cân đối", "Trạng thái", "Hành động"].map(h => (
                          <th key={h} className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap last:text-right">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {status === "loading" && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center">
                            <Loader2 size={24} className="animate-spin text-primary-custom mx-auto" />
                          </td>
                        </tr>
                      )}
                      {status !== "loading" && items.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                              <BarChart3 size={40} strokeWidth={1} />
                              <p className="text-sm font-semibold">Chưa có báo cáo nào</p>
                              <p className="text-xs">Nhấn "Tạo Báo cáo mới" để bắt đầu.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                      {items.map(report => (
                        <tr
                          key={report.id}
                          className="hover:bg-slate-50/70 transition-colors duration-150 group cursor-pointer"
                          onClick={() => setDetailReport(report)}
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors line-clamp-1">{report.title}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {report.createdByName ?? `ID: ${report.createdBy}`} • #{report.id}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <ReportTypeBadge type={report.type} />
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {fmtDate(report.fromDate)} — {fmtDate(report.toDate)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <TrendingUp size={12} /> {fmt(report.totalIncome)}
                              </span>
                              <span className="text-rose-500 font-semibold flex items-center gap-1">
                                <TrendingDown size={12} /> {fmt(report.totalExpense)}
                              </span>
                              <span className={`font-bold flex items-center gap-1 ${report.netBalance >= 0 ? "text-blue-700" : "text-rose-600"}`}>
                                <Scale size={12} /> {fmt(report.netBalance)}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <ReportStatusBadge status={report.status} />
                          </td>
                          <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                id={`btn-recalc-${report.id}`}
                                onClick={() => handleRecalculate(report.id)}
                                disabled={recalcId === report.id}
                                title="Tái tính số liệu"
                                className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-all cursor-pointer disabled:opacity-40"
                              >
                                {recalcId === report.id ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                              </button>
                              <button
                                id={`btn-export-pdf-${report.id}`}
                                onClick={() => handleExportPdf(report.id)}
                                title="Xuất PDF"
                                className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                              >
                                <FileDown size={15} />
                              </button>
                              <button
                                id={`btn-edit-report-${report.id}`}
                                onClick={() => { setEditReport(report); setIsFormOpen(true); }}
                                title="Chỉnh sửa"
                                className="p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-all cursor-pointer"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                id={`btn-delete-report-${report.id}`}
                                onClick={() => handleDelete(report)}
                                title="Xóa báo cáo"
                                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                    <p className="text-xs font-semibold text-slate-400">
                      {totalElements > 0
                        ? `Hiển thị trang ${currentPage} / ${totalPages} (${totalElements.toLocaleString()} báo cáo)`
                        : "Không có kết quả"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        id="rpt-pager-prev"
                        disabled={currentPage === 1}
                        onClick={() => dispatch(setParams({ page: currentPage - 1 }))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        const p = totalPages <= 7 ? i + 1 : i === 0 ? 1 : i === 6 ? totalPages : currentPage - 2 + i;
                        return (
                          <button
                            key={p}
                            id={`rpt-pager-${p}`}
                            onClick={() => dispatch(setParams({ page: p }))}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer
                              ${currentPage === p ? "primary-gradient text-white shadow-sm" : "hover:bg-white text-slate-600 border border-slate-200"}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        id="rpt-pager-next"
                        disabled={currentPage === totalPages}
                        onClick={() => dispatch(setParams({ page: currentPage + 1 }))}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ReportFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditReport(null); }}
        onSubmit={handleFormSubmit}
        editReport={editReport}
        userId={userId}
      />

      {detailReport && (
        <ReportDetailPanel
          report={detailReport}
          onClose={() => setDetailReport(null)}
          onRecalculate={handleRecalculate}
          onExportPdf={handleExportPdf}
          isRecalculating={recalcId === detailReport.id}
        />
      )}
    </div>
  );
}
