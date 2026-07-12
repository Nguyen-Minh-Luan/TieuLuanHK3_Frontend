import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import { X, Calendar, WalletCards, Loader2 } from "lucide-react";
import type { AppDispatch, RootState } from "../../store";
import { createReconciliation } from "../../store/slices/reconciliationSlice";
import { fetchFunds } from "../../store/slices/fundSlice";
import type { ReconciliationRequest } from "./apiTypes";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReconciliationFormModal({ onClose, onSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const submitStatus = useSelector((state: RootState) => state.reconciliation.submitStatus);
  const { items: funds, status: fundStatus } = useSelector((state: RootState) => state.fund);

  const [selectedFunds, setSelectedFunds] = useState<number[]>([]);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fundStatus === "idle") {
      dispatch(fetchFunds({}));
    }
  }, [fundStatus, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFunds.length === 0) {
      setError("Vui lòng chọn ít nhất một quỹ để kiểm kê");
      return;
    }
    if (!periodStart || !periodEnd) {
      setError("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc");
      return;
    }
    if (new Date(periodStart) > new Date(periodEnd)) {
      setError("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    setError(null);
    const req: ReconciliationRequest = {
      fundIds: selectedFunds,
      periodStart,
      periodEnd,
    };

    const action = await dispatch(createReconciliation(req));
    if (createReconciliation.fulfilled.match(action)) {
      onSuccess();
    }
  };

  const toggleFund = (id: number) => {
    setSelectedFunds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Tạo phiên kiểm kê mới</h2>
            <p className="text-sm text-slate-500">Thiết lập khoảng thời gian và chọn quỹ</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Time Period */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Calendar className="w-4 h-4 text-blue-500" />
              Kỳ kiểm kê
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Funds Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <WalletCards className="w-4 h-4 text-blue-500" />
              Chọn quỹ cần kiểm kê
            </label>
            {fundStatus === "loading" ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                {funds.map((fund) => (
                  <label
                    key={fund.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedFunds.includes(parseInt(fund.id))
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedFunds.includes(parseInt(fund.id))}
                      onChange={() => toggleFund(parseInt(fund.id))}
                    />
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${selectedFunds.includes(parseInt(fund.id)) ? "text-blue-900" : "text-slate-700"}`}>
                        {fund.name}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500">
              Bạn có thể chọn nhiều quỹ cùng lúc. Mỗi quỹ sẽ tạo ra một phiên kiểm kê riêng biệt.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitStatus === "loading"}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              {submitStatus === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Tạo phiên</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
