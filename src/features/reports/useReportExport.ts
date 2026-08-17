import { useState } from "react";
import reportService from "../../services/reportService";
import toast from "react-hot-toast";

export function useReportExport() {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  const previewReport = async (reportId: number) => {
    if (isNaN(reportId)) {
      toast.error("Không xác định được báo cáo để xem trước.");
      return;
    }
    setLoadingId(reportId);
    setPreviewBlobUrl(null);
    try {
      const { blob } = await reportService.previewReportPdfBlob(reportId);
      const url = window.URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch {
      toast.error("Không thể xem trước báo cáo.");
    } finally {
      setLoadingId(null);
    }
  };

  const downloadReport = (reportId: number) => {
    window.open(reportService.exportPdfUrl(reportId), "_blank");
  };

  const clearPreview = () => {
    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
  };

  return { previewReport, downloadReport, clearPreview, previewBlobUrl, loadingId };
}
