import React, { useState } from 'react';
import {
  Settings,
  User,
  RotateCcw,
  Check,
  ShieldCheck,
  HelpCircle,
  Building2,
  DollarSign,
  BellRing
} from 'lucide-react';

interface SettingsViewProps {
  onResetData: () => void;
  onShowNotification: (message: string) => void;
}

export default function SettingsView({ onResetData, onShowNotification }: SettingsViewProps) {
  // Admin General settings
  const [currency, setCurrency] = useState('VND');
  const [notificationInterval, setNotificationInterval] = useState('7');
  const [safetyBufferPercent, setSafetyBufferPercent] = useState('80');
  const [companyName, setCompanyName] = useState('FPT Global Holdings');
  const [taxCode, setTaxCode] = useState('0101234567');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onShowNotification('Cấu hình hệ thống Equity Ledger đã được áp dụng thành công!');
  };

  const handleResetDb = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu công nợ về trạng thái ban đầu của hình ảnh mô phỏng không?')) {
      onResetData();
      onShowNotification('Đã hoàn tác và khôi phục toàn bộ dữ liệu gốc từ kịch bản!');
    }
  };

  return (
    <div id="settings-view-wrapper" className="flex-1 min-h-screen bg-[#f8f9fb] px-8 py-8 space-y-8 overflow-y-auto select-none font-sans">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-extrabold text-[#003178] tracking-tight">
          Cấu hình Hệ thống
        </h2>
        <p className="text-xs font-medium text-[#64748b] mt-1.5">
          Tùy chỉnh thông số cốt lõi cho động cơ tính toán rủi ro nợ và đồng bộ phân loại danh mục.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col form Settings */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,31,120,0.01)] border border-[#eaecf0]/10">
          <form onSubmit={handleSaveSettings} className="space-y-6">

            <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
              <Settings className="w-5 h-5 text-[#003178]" />
              <h3 className="text-sm font-extrabold text-[#0f172a] font-display">Thông số điều hành tài chính</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  Tên tổ chức / Pháp nhân
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3 text-[#94a3b8] w-4 h-4" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] pl-11 pr-4 py-3 rounded-xl transition-all outline-none"
                    placeholder="Ví dụ: Công ty CP Equity Venture..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  Mã số thuế doanh nghiệp
                </label>
                <input
                  type="text"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none"
                  placeholder="010xxxxxx"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  Đơn vị tiền tệ chính
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none"
                >
                  <option value="VND">Vietnamese Đống (đ)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  Cảnh báo sớm hằng ngày
                </label>
                <select
                  value={notificationInterval}
                  onChange={(e) => setNotificationInterval(e.target.value)}
                  className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none"
                >
                  <option value="3">3 ngày trước hạn</option>
                  <option value="7">7 ngày trước hạn (Mặc định)</option>
                  <option value="15">15 ngày trước hạn</option>
                  <option value="30">30 ngày trước hạn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  Ngưỡng đòn bẩy rủi ro ngân sách
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={safetyBufferPercent}
                    onChange={(e) => setSafetyBufferPercent(e.target.value)}
                    className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-extrabold text-[#0f172a] pl-4 pr-12 py-3 rounded-xl transition-all outline-none"
                    placeholder="80"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-[#94a3b8]">%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#f1f5f9]">
              <button
                type="submit"
                className="bg-[#003178] hover:bg-[#00255a] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Lưu cấu hình hệ thống</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right side Reset / Admin Profile Card */}
        <div className="space-y-6">
          {/* PROFILE PANEL */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,31,120,0.01)] border border-[#eaecf0]/10 flex flex-col items-center text-center">
            <img
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150&h=150"
              alt="Alex Nguyen Portrait"
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-[#003178]/5 shadow-md mb-4"
            />
            <h3 className="text-base font-extrabold text-[#0f172a] font-display">Alex Nguyen</h3>
            <p className="text-[10px] font-mono font-bold text-[#64748b] tracking-wider uppercase mt-0.5">ADMINISTRATOR</p>

            <div className="w-full bg-[#f8f9fb] border border-[#eaecf0]/30 rounded-xl p-3.5 mt-5 text-left text-xs font-semibold text-[#475569] space-y-2">
              <p>📍 Quyền hạn: Toàn quyền quản trị</p>
              <p>📧 Email: alex.nguyen@company.com</p>
              <p>💼 Bộ phận: Ban Giám đốc Tài chính</p>
            </div>
          </div>

          {/* DANGEROUS DISASTER DATA AREA (RESTORATION ZONE) */}
          <div className="bg-[#fef2f2] rounded-2xl p-6 border border-[#fca5a5]/20">
            <h4 className="text-xs font-extrabold text-[#991b1b] font-display flex items-center gap-1.5 uppercase tracking-wide">
              <RotateCcw className="w-4 h-4" /> Vùng Khôi Phục Dữ Liệu
            </h4>
            <p className="text-xs text-[#991b1b] mt-2 font-medium leading-relaxed">
              Bạn có thể dễ dàng xóa toàn bộ thay đổi tạm thời do thêm, sửa hoặc xóa dòng để khôi phục danh sách nợ chính xác ban đầu của hình ảnh mô phỏng.
            </p>
            <button
              id="btn-settings-reset-db"
              type="button"
              onClick={handleResetDb}
              className="w-full mt-4 bg-[#ef4444] hover:bg-[#b91c1c] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow shadow-red-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục dữ liệu gốc</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
