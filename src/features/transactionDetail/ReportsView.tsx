/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BarChart3, Download, FileSpreadsheet, FileText, Share2 } from 'lucide-react';

export default function ReportsView() {
  const reports = [
    { title: 'Báo cáo Kiểm toán Lưu chuyển Tiền tệ Q2 - 2026', size: '12.4 MB', date: '25/05/2026', format: 'PDF' },
    { title: 'Tờ khai Thuế Nhà thầu & VAT Phân khu Vận tải', size: '4.8 MB', date: '22/05/2026', format: 'EXCEL' },
    { title: 'Sao kê Tài khoản Thanh toán Standard Chartered Q1', size: '28.1 MB', date: '15/04/2026', format: 'CSV' },
    { title: 'Đánh giá Rủi ro Công nợ & Danh mục Đầu tư Quý I', size: '8.2 MB', date: '10/04/2026', format: 'PDF' }
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-[#eceef0] pb-6">
        <h1 className="font-headline text-3xl font-extrabold text-[#003178] tracking-tight">Trung tâm Báo cáo &amp; Phân tích</h1>
        <p className="text-sm text-[#737783] mt-1">Xuất bản tài liệu hạch toán, sao kê dòng tiền và kiểm soát thuế tự động.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm md:col-span-2 space-y-6">
          <h3 className="font-headline text-base font-extrabold text-[#191c1e] uppercase tracking-wider">Tài liệu sẳn sàng tải xuống</h3>
          <div className="space-y-4">
            {reports.map((rep, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#f8f9fb] hover:bg-[#eceef0]/50 rounded-xl transition-colors border border-[#eceef0]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#003178]/10 text-[#003178] rounded-xl flex items-center justify-center">
                    {rep.format === 'PDF' && <FileText size={18} />}
                    {rep.format === 'EXCEL' && <FileSpreadsheet size={18} />}
                    {rep.format === 'CSV' && <BarChart3 size={18} />}
                  </div>
                  <div>
                    <h4 className="text-xs lg:text-sm font-bold text-[#191c1e]">{rep.title}</h4>
                    <p className="text-[10px] text-[#737783] mt-0.5">Phát hành: {rep.date} • Dung lượng: {rep.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Đang tải tập tin: ${rep.title}`)}
                  className="p-2 text-[#434652] hover:text-[#003178] hover:bg-[#f2f4f6] rounded-lg transition-all cursor-pointer"
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#003178] text-white rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-headline text-sm font-bold uppercase tracking-wider text-[#b0c6ff]">Yêu cầu Báo cáo Tùy chỉnh</h3>
            <p className="text-xs text-[#b0c6ff] leading-relaxed">
              Hãy lọc khung thời gian để hệ thống biên soạn dữ liệu tài khóa tự động gửi trực tiếp về email audit được phê duyệt của bộ phận tài chính.
            </p>
            <div className="space-y-2 pt-2">
              <label className="text-[9px] uppercase tracking-wider font-extrabold text-white block">Khung thời gian</label>
              <select className="bg-white/10 text-white rounded-lg p-2.5 w-full text-xs font-semibold border border-white/20 outline-none">
                <option value="q2" className="text-black">Quý II - Năm tài chính 2026</option>
                <option value="q1" className="text-black">Quý I - Năm tài chính 2026</option>
                <option value="all" className="text-black">Tất cả năm 2025</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => alert("Yêu cầu tổng hợp báo cáo đã được chuyển cho Ban kiểm toán nội bộ. Tập tin sẽ được gửi trong 5 phút.")}
            className="mt-8 bg-white text-[#003178] hover:bg-[#f2f4f6] font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
          >
            Yêu cầu Tổng hợp (Compile PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
