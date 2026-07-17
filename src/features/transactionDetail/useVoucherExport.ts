import { useState } from "react";
import voucherService from "../../services/voucherService";
import toast from "react-hot-toast";

export function useVoucherExport() {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  const downloadVoucher = async (transactionId: number) => {
    if (isNaN(transactionId)) {
      toast.error("Không xác định được giao dịch để xuất phiếu.");
      return;
    }
    setLoadingId(transactionId);
    try {
      const { blob, filename } = await voucherService.getTransactionVoucherBlob(transactionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error("Không thể xuất phiếu. Vui lòng thử lại.");
    } finally {
      setLoadingId(null);
    }
  };

  const previewVoucher = async (transactionId: number) => {
    if (isNaN(transactionId)) {
      toast.error("Không xác định được giao dịch để xem trước.");
      return;
    }
    setLoadingId(transactionId);
    setPreviewBlobUrl(null);
    try {
      const { blob } = await voucherService.previewTransactionVoucherBlob(transactionId);
      const url = window.URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch (err: any) {
      toast.error("Không thể xem trước phiếu.");
    } finally {
      setLoadingId(null);
    }
  };

  const clearPreview = () => {
    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
  };

  return { downloadVoucher, previewVoucher, clearPreview, previewBlobUrl, loadingId };
}
