import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatVND } from "../../utils/formatCurrency";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarCheck,
  PlusCircle,
  Search,
  Filter,
  Lock,
  Unlock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store";
import {
  fetchReconciliations,
  setParams,
  deleteReconciliation,
  resetSubmitStatus,
} from "../../store/slices/reconciliationSlice";
import type { ReconciliationStatus } from "./apiTypes";
import ReconciliationFormModal from "./ReconciliationFormModal";
import { Sidebar } from "../../component/Sidebar";
import Header from "../../component/Header";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ReconciliationStatus, { label: string; cls: string }> = {
  DRAFT: { label: "Nháp", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
  CLOSED: { label: "Đã chốt", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  REOPENED: { label: "Mở lại", cls: "bg-blue-100 text-blue-700 border border-blue-200" },
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}


// ─── Component ────────────────────────────────────────────────────────────────

export default function ReconciliationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, totalPages, totalElements, params, status, submitStatus, error } = useSelector(
    (state: RootState) => state.reconciliation
  );
  const role = useSelector((state: RootState) => state.auth.role);

  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchFundId, setSearchFundId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const canManage = role === 1 || role === 3; // Admin or Thủ quỹ

  useEffect(() => {
    dispatch(fetchReconciliations(params));
  }, [dispatch, params]);

  useEffect(() => {
    if (submitStatus === "succeeded") {
      dispatch(fetchReconciliations(params));
      dispatch(resetSubmitStatus());
    }
  }, [submitStatus, dispatch, params]);

  const handleFilter = () => {
    dispatch(
      setParams({
        ...params,
        page: 1,
        status: filterStatus || undefined,
        fundId: searchFundId ? parseInt(searchFundId) : undefined,
      })
    );
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa phiên kiểm kê nháp này?")) return;
    dispatch(deleteReconciliation(id));
  };

  return (
    <div
      id="app-root-container"
      className="flex min-h-screen bg-surface text-on-surface-custom select-none font-sans relative antialiased"
    >
      {/* Sidebar Navigation - Left anchor */}
      <Sidebar />

      {/* Main content area */}
      <main
        id="app-main-content-well"
        className="flex-1 flex flex-col min-h-screen bg-surface overflow-hidden"
      >
        <Header
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Tìm theo tên quỹ, kỳ kiểm kê..."
        />

        <div className="flex-1 px-8 py-8 space-y-6 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30">
            <CalendarCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kiểm kê quỹ</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Quản lý & đối chiếu số dư quỹ theo kỳ
            </p>
          </div>
        </div>
        {canManage && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm kiểm kê quỹ</span>
          </motion.button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="number"
            placeholder="Tìm theo Fund ID..."
            value={searchFundId}
            onChange={(e) => setSearchFundId(e.target.value)}
            className="bg-transparent text-sm outline-none text-slate-700 w-full"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-sm outline-none text-slate-700"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="CLOSED">Đã chốt</option>
            <option value="REOPENED">Mở lại</option>
          </select>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Áp dụng
        </motion.button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {status === "loading" ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <CalendarCheck className="w-12 h-12 opacity-30" />
            <p className="font-medium">Chưa có phiên kiểm kê nào</p>
            {canManage && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Thêm kiểm kê quỹ đầu tiên →
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left font-semibold text-slate-500 px-5 py-3.5">Quỹ</th>
                  <th className="text-left font-semibold text-slate-500 px-5 py-3.5">Khoảng thời gian</th>
                  <th className="text-right font-semibold text-slate-500 px-5 py-3.5">Số dư HT (cuối kỳ)</th>
                  <th className="text-right font-semibold text-slate-500 px-5 py-3.5">Thực tế</th>
                  <th className="text-right font-semibold text-slate-500 px-5 py-3.5">Chênh lệch</th>
                  <th className="text-center font-semibold text-slate-500 px-5 py-3.5">Trạng thái</th>
                  <th className="text-left font-semibold text-slate-500 px-5 py-3.5">Người tạo</th>
                  <th className="text-center font-semibold text-slate-500 px-5 py-3.5">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {items.map((item) => {
                    const statusCfg = STATUS_CONFIG[item.status];
                    const diff = item.difference;
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                        onClick={() => navigate(`/reconciliation/${item.id}`)}
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">{item.fundName}</div>
                          {item.groupCode && (
                            <div className="text-xs text-slate-400 mt-0.5">{item.groupCode}</div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(item.periodStart)} → {formatDate(item.periodEnd)}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-slate-700">
                          {formatVND(item.closingBalanceSystem)}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-slate-700">
                          {formatVND(item.actualBalance)}
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-semibold">
                          {diff !== undefined && diff !== null ? (
                            <span className={diff === 0 ? "text-emerald-600" : diff > 0 ? "text-blue-600" : "text-red-500"}>
                              {diff > 0 ? "+" : ""}{formatVND(diff)}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.cls}`}>
                            {item.status === "CLOSED" && <Lock className="w-3 h-3" />}
                            {item.status === "REOPENED" && <Unlock className="w-3 h-3" />}
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-xs">
                          {item.createdBy}<br />
                          <span className="text-slate-400">{formatDate(item.createdAt)}</span>
                        </td>
                        <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => navigate(`/reconciliation/${item.id}`)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Chi tiết"
                            >
                              <FileText className="w-4 h-4" />
                            </motion.button>
                            {item.status === "DRAFT" && canManage && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <span className="text-xs font-bold">✕</span>
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Tổng <strong>{totalElements}</strong> phiên kiểm kê
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={params.page === 1}
                onClick={() => dispatch(setParams({ ...params, page: (params.page ?? 1) - 1 }))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-slate-700 px-2">
                {params.page} / {totalPages}
              </span>
              <button
                disabled={params.page === totalPages}
                onClick={() => dispatch(setParams({ ...params, page: (params.page ?? 1) + 1 }))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
        </div>
      </main>

      {/* Error toast */}
      <AnimatePresence>
        {error && submitStatus === "failed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 shadow-xl flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      {showForm && (
        <ReconciliationFormModal
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            dispatch(fetchReconciliations(params));
          }}
        />
      )}
    </div>
  );
}
