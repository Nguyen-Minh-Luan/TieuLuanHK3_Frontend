import apiClient from "./apiClient";

const voucherService = {
  getTransactionVoucherBlob: async (transactionId: number) => {
    const res = await apiClient.get(`/pdf/transactions/${transactionId}`, {
      responseType: "blob",
    });
    const disposition = res.headers["content-disposition"] || "";
    const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    const filename = match ? decodeURIComponent(match[1]) : `phieu-${transactionId}.pdf`;
    return { blob: res.data as Blob, filename };
  },

  previewTransactionVoucherBlob: async (transactionId: number) => {
    const res = await apiClient.get(`/pdf/transactions/${transactionId}/preview`, {
      responseType: "blob",
    });
    return { blob: res.data as Blob };
  },
};

export default voucherService;
