import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, AlertTriangle, Send } from 'lucide-react';
import { fetchFunds } from '../../store/slices/fundSlice';
import { fundTransferService } from '../../services/fundTransferService';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
interface Props {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function FundTransferFormModal({ visible, onCancel, onSuccess, onError }: Props) {
  const dispatch = useAppDispatch();
  const { items: funds, status: fundStatus } = useAppSelector((state) => state.fund);
  const fundsLoading = fundStatus === 'loading';
  const [loading, setLoading] = useState(false);

  const [fromFundId, setFromFundId] = useState<string>('');
  const [toFundId, setToFundId] = useState<string>('');
  const [amount, setAmount] = useState<number | undefined>();
  const [displayAmount, setDisplayAmount] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      dispatch(fetchFunds({ page: 1, size: 100 }));
      setFromFundId('');
      setToFundId('');
      setAmount(undefined);
      setDisplayAmount('');
      setReason('');
      setNote('');
      setErrors({});
    }
  }, [visible, dispatch]);
  console.log('funds:', funds);
  console.log('statuses:', funds.map(f => JSON.stringify(f.status)));
  const activeFunds = funds.filter(f => f.status === 'ACTIVE');
  const selectedFromFund = activeFunds.find(f => f.id === fromFundId);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (!raw) {
      setAmount(undefined);
      setDisplayAmount('');
      return;
    }
    const val = parseInt(raw, 10);
    setAmount(val);
    setDisplayAmount(new Intl.NumberFormat('vi-VN').format(val));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fromFundId) errs.fromFundId = 'Vui lòng chọn quỹ nguồn.';
    if (!toFundId) errs.toFundId = 'Vui lòng chọn quỹ đích.';
    if (fromFundId && toFundId && fromFundId === toFundId) {
      errs.toFundId = 'Quỹ đích phải khác quỹ nguồn.';
    }
    if (!amount || amount <= 0) {
      errs.amount = 'Vui lòng nhập số tiền lớn hơn 0.';
    } else if (selectedFromFund && amount > selectedFromFund.availableBalance) {
      errs.amount = 'Số tiền vượt quá số dư khả dụng của quỹ nguồn.';
    }
    if (!reason.trim()) errs.reason = 'Vui lòng nhập lý do chuyển tiền.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await fundTransferService.transferFund({
        fromFundId: Number(fromFundId),
        toFundId: Number(toFundId),
        amount: amount!,
        reason: reason.trim(),
        note: note.trim(),
      });
      onSuccess('Chuyển quỹ thành công');
    } catch (error: any) {
      onError(error.response?.data?.message || 'Có lỗi xảy ra khi chuyển quỹ');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const inputClass = (hasErr?: boolean) =>
    `w-full bg-[#f8f9fb] border ${hasErr ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 border border-[#e2e8f0]/40">
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-xl text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#003178]/10 rounded-xl">
              <ArrowRightLeft className="w-5 h-5 text-[#003178]" />
            </div>
            <h2 className="text-xl font-display font-extrabold text-[#003178]">
              Tạo lệnh chuyển quỹ
            </h2>
          </div>
          <p className="text-xs text-[#64748b] font-medium">
            Thực hiện luân chuyển tiền giữa các quỹ nội bộ.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Từ Quỹ (Quỹ nguồn) <span className="text-[#d91c1c]">*</span>
              </label>
              <select
                value={fromFundId}
                onChange={(e) => setFromFundId(e.target.value)}
                className={`${inputClass(!!errors.fromFundId)} cursor-pointer`}
                disabled={fundsLoading}
              >
                <option value="" disabled>Chọn quỹ nguồn</option>
                {activeFunds.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name} (Số dư: {new Intl.NumberFormat('vi-VN').format(fund.availableBalance)} đ)
                  </option>
                ))}
              </select>
              {errors.fromFundId && <span className="text-xs text-[#ef4444] mt-1 block">{errors.fromFundId}</span>}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Đến Quỹ (Quỹ đích) <span className="text-[#d91c1c]">*</span>
              </label>
              <select
                value={toFundId}
                onChange={(e) => setToFundId(e.target.value)}
                className={`${inputClass(!!errors.toFundId)} cursor-pointer`}
                disabled={fundsLoading}
              >
                <option value="" disabled>Chọn quỹ đích</option>
                {activeFunds.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name}
                  </option>
                ))}
              </select>
              {errors.toFundId && <span className="text-xs text-[#ef4444] mt-1 block">{errors.toFundId}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Số Tiền Chuyển (VNĐ) <span className="text-[#d91c1c]">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={displayAmount}
              onChange={handleAmountChange}
              placeholder="0"
              className={inputClass(!!errors.amount)}
            />
            {errors.amount && <span className="text-xs text-[#ef4444] mt-1 block">{errors.amount}</span>}
          </div>

          {selectedFromFund && amount !== undefined && amount > selectedFromFund.availableBalance && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Số tiền vượt quá số dư khả dụng của quỹ nguồn</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Lý Do Chuyển <span className="text-[#d91c1c]">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do luân chuyển"
              className={`${inputClass(!!errors.reason)} py-3 resize-none`}
            />
            {errors.reason && <span className="text-xs text-[#ef4444] mt-1 block">{errors.reason}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Ghi Chú Thêm (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm"
              className={`${inputClass()} py-3 resize-none`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#003178] to-[#0d47a1] hover:from-[#002255] hover:to-[#0a3881] disabled:opacity-60 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Đang xử lý...' : 'Thực hiện chuyển'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}