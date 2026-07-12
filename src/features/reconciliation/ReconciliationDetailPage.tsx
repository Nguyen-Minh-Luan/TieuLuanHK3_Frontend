import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  WalletCards,
  Lock,
  Unlock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store";
import {
  fetchReconciliationById,
  updateDraftReconciliation,
  closeReconciliation,
  reopenReconciliation,
  resetSubmitStatus,
} from "../../store/slices/reconciliationSlice";
import type { ReconciliationStatus } from "./apiTypes";

const STATUS_CONFIG: Record<ReconciliationStatus, { label: string; cls: string; icon: any }> = {
  DRAFT:    { label: "Nháp",       cls: "bg-amber-100 text-amber-700",       icon: Calendar },
  CLOSED:   { label: "Đã chốt",   cls: "bg-emerald-100 text-emerald-700", icon: Lock },
  REOPENED: { label: "Mở lại",    cls: "bg-blue-100 text-blue-700",        icon: Unlock },
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN");
}

function formatCurrency(amount?: number) {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export default function ReconciliationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selectedItem: item, status, submitStatus, error } = useSelector(
    (state: RootState) => state.reconciliation
  );
  const role = useSelector((state: RootState) => state.auth.role);

  const [actualBalanceStr, setActualBalanceStr] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [reopenReason, setReopenReason] = useState<string>("");
  const [showReopenForm, setShowReopenForm] = useState(false);

  const canManage = role === 1 || role === 3;
  const canReopen = role === 1;

  useEffect(() => {
    if (id) {
      dispatch(fetchReconciliationById(parseInt(id)));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (item) {
      setActualBalanceStr(item.actualBalance?.toString() ?? "");
      setNote(item.note ?? "");
    }
  }, [item]);

  useEffect(() => {
    if (submitStatus === "succeeded") {
      setShowReopenForm(false);
      setReopenReason("");
      dispatch(resetSubmitStatus());
    }
  }, [submitStatus, dispatch]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 min-h-screen">
        Không tìm thấy phiên kiểm kê.
      </div>
    );
  }

  const isDraft = item.status === "DRAFT";
  const diff = item.difference;
  const statusCfg = STATUS_CONFIG[item.status];
  const StatusIcon = statusCfg.icon;

  const handleSaveDraft = () => {
    const balance = parseFloat(actualBalanceStr);
    if (isNaN(balance)) {
      alert("Số dư thực tế không hợp lệ");
      return;
    }
    dispatch(
      updateDraftReconciliation({
        id: item.id,
        data: { actualBalance: balance, note },
      })
    );
  };

  const handleClose = () => {
    if (!window.confirm("Bạn chắc chắn muốn chốt phiên kiểm kê này? Sau khi chốt sẽ không thể thêm/sửa/xóa giao dịch trong khoảng thời gian này.")) {
      return;
    }
    dispatch(closeReconciliation(item.id));
  };

  const handleReopen = () => {
    if (!reopenReason.trim()) {
      alert("Vui lòng nhập lý do mở khóa");
      return;
    }
    dispatch(reopenReconciliation({ id: item.id, reason: reopenReason }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/reconciliation")}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              Phiên kiểm kê #{item.id}
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.cls}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusCfg.label}
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Chi tiết kiểm kê quỹ và chênh lệch
            </p>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-3">
          {isDraft && canManage && (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={submitStatus === "loading"}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                Lưu nháp
              </button>
              <button
                onClick={handleClose}
                disabled={submitStatus === "loading"}
                className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Chốt kiểm kê
              </button>
            </>
          )}
          {item.status === "CLOSED" && canReopen && (
            <button
              onClick={() => setShowReopenForm(!showReopenForm)}
              className="flex items-center gap-2 bg-amber-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              Mở khóa
            </button>
          )}
        </div>
      </div>

      {error && submitStatus === "failed" && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Reopen form */}
      {showReopenForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-1">
              Lý do mở khóa (Bắt buộc)
            </label>
            <input
              type="text"
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none"
              placeholder="Nhập lý do..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReopen}
              disabled={submitStatus === "loading"}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              Xác nhận mở khóa
            </button>
            <button
              onClick={() => setShowReopenForm(false)}
              className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50"
            >
              Hủy
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm col-span-1 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
              <WalletCards className="w-4 h-4" /> Thông tin Quỹ
            </h3>
            <div className="text-lg font-bold text-slate-800">{item.fundName}</div>
            {item.groupCode && <div className="text-sm text-slate-500">Mã nhóm: {item.groupCode}</div>}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4" /> Thời gian
            </h3>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Từ ngày:</span>
                <span className="font-medium">{formatDate(item.periodStart)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đến ngày:</span>
                <span className="font-medium">{formatDate(item.periodEnd)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 space-y-1">
              <p>Tạo bởi: <strong className="text-slate-700">{item.createdBy}</strong> lúc {formatDateTime(item.createdAt)}</p>
              {item.closedBy && <p>Chốt bởi: <strong className="text-slate-700">{item.closedBy}</strong> lúc {formatDateTime(item.closedAt)}</p>}
              {item.reopenedBy && (
                <p>
                  Mở lại bởi: <strong className="text-slate-700">{item.reopenedBy}</strong> lúc {formatDateTime(item.reopenedAt)}<br/>
                  Lý do: {item.reopenReason}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm col-span-1 md:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">
            Đối chiếu số dư
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="text-sm font-semibold text-slate-500 mb-1">Số dư theo hệ thống</div>
              <div className="text-3xl font-mono font-bold text-slate-800">
                {formatCurrency(item.closingBalanceSystem)}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Tính toán dựa trên các giao dịch đến hết ngày {formatDate(item.periodEnd)}
              </div>
            </div>

            <div className={`rounded-xl p-5 border ${isDraft ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-slate-50"}`}>
              <div className="text-sm font-semibold text-slate-500 mb-2">Số dư thực tế</div>
              {isDraft ? (
                <input
                  type="number"
                  value={actualBalanceStr}
                  onChange={(e) => setActualBalanceStr(e.target.value)}
                  placeholder="Nhập số dư thực tế..."
                  className="w-full text-2xl font-mono font-bold text-slate-800 bg-white border border-blue-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <div className="text-3xl font-mono font-bold text-slate-800">
                  {formatCurrency(item.actualBalance)}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Chênh lệch</div>
              <div className="text-xs text-slate-400">Thực tế - Hệ thống</div>
            </div>
            <div className="text-3xl font-mono font-bold">
              {diff !== undefined && diff !== null ? (
                <span className={diff === 0 ? "text-emerald-600" : diff > 0 ? "text-blue-600" : "text-red-500"}>
                  {diff > 0 ? "+" : ""}{formatCurrency(diff)}
                </span>
              ) : (
                <span className="text-slate-300">—</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ghi chú
            </label>
            {isDraft ? (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú chênh lệch (nếu có)..."
                className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            ) : (
              <div className="w-full min-h-[6rem] bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
                {item.note || <span className="text-slate-400 italic">Không có ghi chú</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
