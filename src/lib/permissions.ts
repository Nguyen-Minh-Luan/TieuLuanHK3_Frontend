/**
 * permissions.ts — Cấu hình phân quyền frontend theo role
 *
 * Role map:
 *   0 = VIEWER (Người xem)
 *   1 = ADMIN (Quản trị viên)
 *   2 = KETOAN_THU_CHI (Kế toán Thu Chi)
 *   3 = KE_TOAN_QUY (Kế toán Quỹ)
 *   4 = TONGHOP (Kế toán Tổng hợp)
 *
 * Lưu ý: Đây chỉ là cơ chế ẩn/hiện UI.
 * Phân quyền thật sự được enforce ở backend (Spring Security + @PreAuthorize).
 */

/** Các label menu được phép thấy theo role */
export const ROLE_MENU_KEYS: Record<number, string[]> = {
  0: ["Dashboard"],
  1: [
    "Dashboard",
    "Transactions",
    "Debt",
    "Reports",
    "Budgets",
    "Categories",
    "Partners",
    "Reconciliation",
    "Fund Transfer",
    "Users",
    "Documents",
  ],
  2: [
    "Dashboard",
    "Transactions",
    "Debt",
    "Budgets",
    "Categories",
    "Partners",
    "Documents",
  ],
  3: [
    "Dashboard",
    "Transactions",
    "Budgets",
    "Reconciliation",
    "Fund Transfer",
    "Documents",
  ],
  4: [
    "Dashboard",
    "Transactions",
    "Budgets",
    "Reports",
    "Reconciliation",
    "Fund Transfer",
    "Documents",
  ],
};

/** Các route được phép truy cập theo role (dùng cho RoleGuard) */
export const ROLE_ALLOWED_ROUTES: Record<number, string[]> = {
  0: ["/home"],
  1: [
    "/home",
    "/transaction",
    "/transactions",
    "/report",
    "/users",
    "/admin/userManager",
    "/setting",
    "/budget",
    "/debt",
    "/category",
    "/partners",
    "/reconciliation",
    "/fund-transfer",
    "/documents",
  ],
  2: [
    "/home",
    "/transaction",
    "/transactions",
    "/budget",
    "/debt",
    "/category",
    "/partners",
    "/documents",
  ],
  3: [
    "/home",
    "/transaction",
    "/transactions",
    "/budget",
    "/reconciliation",
    "/fund-transfer",
    "/documents",
  ],
  4: [
    "/home",
    "/transaction",
    "/transactions",
    "/budget",
    "/report",
    "/reconciliation",
    "/fund-transfer",
    "/documents",
  ],
};

/**
 * Kiểm tra xem role có được phép tạo phiếu giao dịch không.
 * Chỉ ADMIN (1) và Kế toán Thu Chi (2).
 */
export function canCreateTransaction(role: number | null): boolean {
  return role === 1 || role === 2;
}

/**
 * Kiểm tra xem role có được phép sửa/xóa phiếu giao dịch không.
 * Nếu là KETOAN_THU_CHI (2), cần kiểm tra thêm ownership ở UI.
 */
export function canEditTransaction(
  role: number | null,
  transactionUserId: number | undefined,
  currentUserId: number | null
): boolean {
  if (role === 1) return true; // Admin: toàn quyền
  if (role === 2) return transactionUserId === currentUserId; // Chỉ phiếu của mình
  return false;
}

/** Kiểm tra quyền quản lý quỹ (tạo/sửa/xóa Fund) — chỉ ADMIN */
export function canManageFund(role: number | null): boolean {
  return role === 1;
}

/** Kiểm tra quyền tạo lệnh chuyển quỹ */
export function canCreateFundTransfer(role: number | null): boolean {
  return role === 1 || role === 3;
}

/** Kiểm tra quyền tạo/chốt/xóa phiên kiểm kê */
export function canManageReconciliation(role: number | null): boolean {
  return role === 1 || role === 3;
}
