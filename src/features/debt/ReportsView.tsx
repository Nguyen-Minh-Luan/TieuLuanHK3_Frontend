import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  ShieldCheck,
  Calendar,
  BarChart2,
  Percent,
  Zap,
  PieChart as PieIcon
} from 'lucide-react';
import type { Debt } from './types';

interface ReportsViewProps {
  debts: Debt[];
}

export default function ReportsView({ debts }: ReportsViewProps) {
  // 1. Calculate general stats
  const activeDebts = useMemo(() => debts.filter(d => d.status !== 'Paid'), [debts]);
  const totalActive = useMemo(() => activeDebts.reduce((sum, d) => sum + d.amount, 0), [activeDebts]);
  const paidDebts = useMemo(() => debts.filter(d => d.status === 'Paid'), [debts]);
  const totalPaid = useMemo(() => paidDebts.reduce((sum, d) => sum + d.amount, 0), [paidDebts]);

  const debtRatio = useMemo(() => {
    const total = debts.reduce((sum, d) => sum + d.amount, 0);
    return total > 0 ? ((totalPaid / total) * 100).toFixed(0) : '0';
  }, [debts, totalPaid]);

  // 2. Prepare Data for Bar Chart: Debt by Creditor Group Category
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {
      'Ngân hàng': 0,
      'Công nghệ': 0,
      'Bất động sản': 0,
      'Vận tải/Logistics': 0,
      'Khác/Thương mại': 0
    };

    activeDebts.forEach(d => {
      if (d.creditorType === 'bank') categories['Ngân hàng'] += d.amount;
      else if (d.creditorType === 'tech') categories['Công nghệ'] += d.amount;
      else if (d.creditorType === 'real_estate') categories['Bất động sản'] += d.amount;
      else if (d.creditorType === 'logistics') categories['Vận tải/Logistics'] += d.amount;
      else categories['Khác/Thương mại'] += d.amount;
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      'Số tiền (triệu đ)': Math.round(value / 1000000),
    }));
  }, [activeDebts]);

  // COLORS for pie segments
  const COLORS = ['#003178', '#0c46a0', '#2563eb', '#60a5fa', '#94a3b8'];

  // 3. Prepare Data for Area Chart: Monthly Outflow projection (simulated based on dueDates)
  const timelineData = useMemo(() => {
    // Collect by June, July, August 2024
    const months: Record<string, { unpaid: number; paid: number }> = {
      'Tháng 05/2024': { unpaid: 0, paid: 0 },
      'Tháng 06/2024': { unpaid: 0, paid: 0 },
      'Tháng 07/2024': { unpaid: 0, paid: 0 },
      'Tháng 08/2024': { unpaid: 0, paid: 0 },
    };

    debts.forEach(d => {
      let targetMonth = 'Tháng 06/2024'; // Default fallback
      if (d.dueDate.includes('/05/')) targetMonth = 'Tháng 05/2024';
      else if (d.dueDate.includes('/06/')) targetMonth = 'Tháng 06/2024';
      else if (d.dueDate.includes('/07/')) targetMonth = 'Tháng 07/2024';
      else if (d.dueDate.includes('/08/')) targetMonth = 'Tháng 08/2024';

      if (d.status === 'Paid') {
        months[targetMonth].paid += d.amount;
      } else {
        months[targetMonth].unpaid += d.amount;
      }
    });

    return Object.entries(months).map(([name, item]) => ({
      name,
      'Đã trả (M)': Math.round(item.paid / 1000000),
      'Chưa trả (M)': Math.round(item.unpaid / 1000000),
    }));
  }, [debts]);

  // Helper to format currency values cleanly in million VND
  const formatM = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'M đ';
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  };

  return (
    <div id="reports-view-wrapper" className="flex-1 min-h-screen bg-[#f8f9fb] px-8 py-8 space-y-8 overflow-y-auto select-none font-sans">
      {/* View Title */}
      <div>
        <h2 className="text-3xl font-display font-extrabold text-[#003178] tracking-tight">
          Báo cáo Phân tích Tài chính
        </h2>
        <p className="text-xs font-medium text-[#64748b] mt-1.5">
          Biểu đồ hóa cấu trúc công nợ, đòn bẩy rủi ro và các kịch bản dự phòng dòng tiền doanh nghiệp.
        </p>
      </div>

      {/* Analytics KPI counters */}
      <div id="reports-kpi-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.01)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#64748b] uppercase block">Tổng nghĩa vụ chưa trả</span>
            <span className="text-xl font-display font-black text-[#003178] block mt-1">{formatVND(totalActive)}</span>
            <span className="text-xs text-[#d91c1c] font-semibold mt-2 block">Chiếm {100 - Number(debtRatio)}% tổng hạn mức nợ</span>
          </div>
          <div className="p-4 bg-[#eff6ff] text-[#003178] rounded-2xl">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.01)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#64748b] uppercase block">Nợ lũy kế đã trả thanh toán</span>
            <span className="text-xl font-display font-black text-[#10b981] block mt-1">{formatVND(totalPaid)}</span>
            <span className="text-xs text-[#10b981] font-semibold mt-2 block">Tỷ lệ thanh khoản dứt điểm: {debtRatio}%</span>
          </div>
          <div className="p-4 bg-[#ecfdf5] text-[#10b981] rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.01)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#64748b] uppercase block">Dự phòng lãi suất tiết kiệm</span>
            <span className="text-xl font-display font-black text-[#0ea5e9] block mt-1">4.5% / năm (Trung bình)</span>
            <span className="text-xs text-[#0ea5e9] font-semibold mt-2 block">Mức tối ưu từ nguồn vốn nhàn rỗi</span>
          </div>
          <div className="p-4 bg-[#e0f2fe] text-[#0ea5e9] rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div id="reports-charts-container" className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* CHART 1: Area line monthly outflow */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.01)] flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-[#003178] flex items-center gap-2 font-display">
              <Calendar className="w-4 h-4 text-[#64748b]" />
              Tiến trình & Dự kiến phân bổ dòng tiền trả nợ (Triệu VND)
            </h3>
            <p className="text-[11px] text-[#64748b] mt-0.5">So sánh tiền nợ đã thanh khoản dứt điểm với số nợ còn treo theo tháng đáo hạn.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorUnpaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003178" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#003178" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value: any) => formatM(Number(value))} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Chưa trả (M)" stroke="#003178" strokeWidth={2} fillOpacity={1} fill="url(#colorUnpaid)" />
                <Area type="monotone" dataKey="Đã trả (M)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPaid)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Bar Chart showing sector allocation */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.01)] flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-[#003178] flex items-center gap-2 font-display">
              <BarChart2 className="w-4 h-4 text-[#64748b]" />
              Phân phối công nợ hiện hữu theo phân khúc (Triệu VND)
            </h3>
            <p className="text-[11px] text-[#64748b] mt-0.5">Xác định tổng số tiền nợ phân chia cụ thể cho các lĩnh vực cốt lõi.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value: any) => formatM(Number(value))} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Số tiền (triệu đ)" fill="#0d47a1" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advisory section in Reports */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.01)] border border-[#cbd5e1]/15">
        <h4 className="text-sm font-bold text-[#0f172a] mb-2 font-display">💡 Phân tích rủi ro & Khuyến nghị cơ cấu</h4>
        <p className="text-xs text-[#475569] leading-relaxed">
          Tỷ lệ công nợ chưa trả của doanh nghiệp tập trung nhiều nhất vào nhóm <strong>Công nghệ & Đơn vị dịch vụ hạ tầng phần mềm</strong>. Chỉ số đòn bẩy thanh toán chung của công ty đạt <strong>dưới 0.50</strong> - đây là ngưỡng tối ưu không gây áp lực về cơ cấu nguồn vốn. Quý công ty khuyến nghị tiếp tục sử dụng các gói bảo lãnh bằng hợp đồng thứ cấp hoặc giãn tiến độ đóng thầu để tối ưu hóa vốn lưu động dự phòng ròng.
        </p>
      </div>
    </div>
  );
}
