/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sliders, CheckCircle } from 'lucide-react';

export default function SettingsView() {
  const [profileName, setProfileName] = useState('Alex Nguyễn');
  const [role, setRole] = useState('Phó phòng Kế toán (CFO Office)');
  const [baseTaxPercent, setBaseTaxPercent] = useState('8.00');
  const [defaultCurrency, setDefaultCurrency] = useState('VND');
  const [riskThreshold, setRiskThreshold] = useState('150000.00');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cập nhật thiết lập thành công!');
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-[#eceef0] pb-6">
        <h1 className="font-headline text-3xl font-extrabold text-[#003178] tracking-tight">Cấu hình Hệ thống &amp; Quy chuẩn</h1>
        <p className="text-sm text-[#737783] mt-1">Quản lý định mức kiểm duyệt, thuế suất hiện hành và thông tin tài khoản kế toán viên.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Profile configuration card */}
        <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm space-y-6">
          <h3 className="font-headline text-base font-extrabold text-[#191c1e] uppercase tracking-wider flex items-center gap-2">
            <Sliders className="text-[#003178]" size={18} />
            <span>Thông tin người sử dụng</span>
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-[#737783] uppercase tracking-wider block mb-1">Họ và tên</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="bg-[#f2f4f6] text-[#191c1e] text-xs font-semibold p-3.5 rounded-xl border border-[#c3c6d4]/50 w-full focus:ring-2 focus:ring-[#003178] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#737783] uppercase tracking-wider block mb-1">Chức vụ phụ trách</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-[#f2f4f6] text-[#191c1e] text-xs font-semibold p-3.5 rounded-xl border border-[#c3c6d4]/50 w-full focus:ring-2 focus:ring-[#003178] outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-xl primary-gradient text-white text-xs font-bold shadow hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Lưu tài khoản
              </button>
            </div>
          </form>
        </div>

        {/* Global audit parameters card */}
        <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm space-y-6">
          <h3 className="font-headline text-base font-extrabold text-[#191c1e] uppercase tracking-wider flex items-center gap-2">
            <Shield className="text-[#003178]" size={18} />
            <span>Định mức Tài khóa &amp; Rủi ro</span>
          </h3>

          <div className="space-y-4 text-xs font-medium text-[#434652]">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#737783] uppercase tracking-wider block mb-1">Thuế suất tiêu chuẩn (%)</label>
                <input
                  type="number"
                  value={baseTaxPercent}
                  onChange={(e) => setBaseTaxPercent(e.target.value)}
                  className="bg-[#f2f4f6] text-[#191c1e] text-xs font-semibold p-3 rounded-xl border border-[#c3c6d4]/50 w-full outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#737783] uppercase tracking-wider block mb-1">Đồng tiền pháp định</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="bg-[#f2f4f6] text-[#191c1e] text-xs font-semibold p-3 rounded-xl border border-[#c3c6d4]/50 w-full outline-none cursor-pointer"
                >
                  <option value="VND">VND (Việt Nam Đồng)</option>
                  <option value="USD">USD (Đô la Mỹ)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#737783] uppercase tracking-wider block mb-1">Hạn mức cảnh báo rủi ro tối đa (VND)</label>
              <input
                type="number"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(e.target.value)}
                className="bg-[#f2f4f6] text-[#191c1e] text-xs font-semibold p-3 rounded-xl border border-[#c3c6d4]/50 w-full outline-none"
              />
              <p className="text-[10px] text-[#737783] mt-1.5 leading-relaxed">
                Tất cả các giao dịch đơn lẻ vượt quá hạn mức này sẽ được gắn thẻ <strong>WARNING</strong> hoặc <strong>RISK</strong> tự động để CFO hậu thẩm định.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
