import { useEffect } from 'react';
import { X, Printer, Loader2 } from 'lucide-react';
import { useReportExport } from './useReportExport';

interface PrintReportModalProps {
  isOpen: boolean;
  reportId: number;
  onClose: () => void;
}

export default function PrintReportModal({ isOpen, reportId, onClose }: PrintReportModalProps) {
  const { previewReport, downloadReport, clearPreview, previewBlobUrl, loadingId } = useReportExport();

  useEffect(() => {
    if (isOpen && reportId) {
      previewReport(reportId);
    }
    return () => {
      clearPreview();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reportId]);

  if (!isOpen) return null;

  const handleDownload = () => {
    downloadReport(reportId);
  };

  const isLoading = loadingId === reportId && !previewBlobUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 border border-[#eceef0] h-[90vh] flex flex-col font-sans">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#eceef0]">
          <div>
            <h3 className="font-headline text-lg font-extrabold text-[#003178] tracking-tight">Phiếu Báo cáo Tài chính PDF</h3>
            <p className="text-xs text-[#737783] mt-0.5">Bản in chính thức từ hệ thống</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="px-5 py-2 rounded-xl primary-gradient text-white text-xs font-bold shadow hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Printer size={14} />
              <span>Tải PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#737783] hover:text-[#003178] hover:bg-[#f2f4f6] rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Xem trước PDF */}
        <div className="flex-1 bg-[#f2f4f6] rounded-lg overflow-hidden border border-[#c3c6d4] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#737783]">
              <Loader2 size={32} className="animate-spin mb-2 text-[#003178]" />
              <p className="text-sm font-semibold">Đang tải bản xem trước...</p>
            </div>
          ) : previewBlobUrl ? (
            <iframe 
              src={previewBlobUrl} 
              className="w-full h-full border-0" 
              title="Xem trước PDF"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
              <p className="text-sm font-semibold mb-2">Không thể tải bản xem trước</p>
              <button 
                onClick={() => previewReport(reportId)}
                className="px-4 py-2 bg-white border border-red-200 rounded-lg text-xs hover:bg-red-50 transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
