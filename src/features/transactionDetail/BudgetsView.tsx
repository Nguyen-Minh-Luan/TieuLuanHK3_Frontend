/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Wallet, ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react';

export default function BudgetsView() {
  const departments = [
    { name: 'Phòng Logistics & Vận tải đường biển', limit: 500000.00, spent: 382450.00, safety: 'An toàn' },
    { name: 'Phòng Marketing & Truyền thông số', limit: 200000.00, spent: 185002.50, safety: 'Cận định mức' },
    { name: 'Phòng Nhân sự & Đóng gói phúc lợi', limit: 150000.00, spent: 32040.50, safety: 'An toàn' },
    { name: 'Phòng Nghiên cứu Phát triển R&D Cloud', limit: 800000.00, spent: 120500.00, safety: 'An toàn' }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-[#eceef0] pb-6">
        <h1 className="font-headline text-3xl font-extrabold text-[#003178] tracking-tight">Hạn mức &amp; Quản trị Ngân sách</h1>
        <p className="text-sm text-[#737783] mt-1">Định biên quỹ hoạt động theo phòng ban nhằm hạn chế rủi ro vượt chi tiêu.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm space-y-6">
          <h3 className="font-headline text-base font-extrabold text-[#191c1e] uppercase tracking-wider flex items-center gap-2">
            <Wallet className="text-[#003178]" size={20} />
            <span>Phân ngạch ngân sách phòng ban năm nay</span>
          </h3>

          <div className="space-y-6">
            {departments.map((dept, idx) => {
              const spentPct = Math.round((dept.spent / dept.limit) * 100);
              const isWarning = spentPct > 85;

              return (
                <div key={idx} className="p-4 rounded-xl border border-[#eceef0] bg-[#f8f9fb] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-[#191c1e] text-sm">{dept.name}</h4>
                      <p className="text-[10px] text-[#737783] mt-0.5">Định mức tối đa: {formatCurrency(dept.limit)} VND</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${isWarning ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                        {dept.safety}
                      </span>
                      <span className="text-xs text-[#191c1e] font-extrabold">{spentPct}% Chi tiêu</span>
                    </div>
                  </div>

                  {/* Horizontal progress bar */}
                  <div className="h-3 w-full bg-[#eceef0] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${spentPct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${isWarning ? 'bg-amber-500' : 'bg-[#003178]'
                        }`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-[#737783]">
                    <span>Đã giải ngân: {formatCurrency(dept.spent)} VND</span>
                    <span>Còn lại: {formatCurrency(dept.limit - dept.spent)} VND</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
