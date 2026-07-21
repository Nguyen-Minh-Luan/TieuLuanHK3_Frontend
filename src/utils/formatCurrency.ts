/**
 * Hàm định dạng số tiền theo chuẩn Việt Nam.
 * Ví dụ: formatVND(1234567) => "1.234.567 đ"
 *
 * Sử dụng chung cho toàn bộ Frontend — không khai báo lại cục bộ.
 */
export const formatVND = (num?: number | null): string => {
  if (num === null || num === undefined || Number.isNaN(num)) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(num) + " đ";
};
