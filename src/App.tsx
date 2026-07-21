import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "./features/Login";
import Home from "./features/Home";
import TransactionPage from "./features/transaction/TransactionPage";
import TransactionDetailPage from "./features/transactionDetail/TransactionDetailPage";
import UserManagementPage from "./features/admin/userManager/UserManagementPage";
import Budget from "./features/budget/Budget";
import ProtectedRoute from "./router/ProtectedRoute";
import RoleGuard from "./router/RoleGuard";
import DebtPage from "./features/debt/DebtPage";
import ReportsView from "./features/reports/ReportsView";
import CategoryPage from "./features/category/CategoryPage";
import PartnerPage from "./features/partner/PartnerPage";
import ReconciliationPage from "./features/reconciliation/ReconciliationPage";
import ReconciliationDetailPage from "./features/reconciliation/ReconciliationDetailPage";
import FundTransferPage from "./features/fundTransfer/FundTransferPage";
import DocumentPage from "./features/document/DocumentPage";

/**
 * Route structure:
 *   /login, /               → public (Login page)
 *   <ProtectedRoute>        → bất kỳ user đã đăng nhập (check token)
 *     <RoleGuard roles=[x]> → kiểm tra role cụ thể
 *
 * Role codes: 0=VIEWER, 1=ADMIN, 2=KETOAN_THU_CHI, 3=KE_TOAN_QUY, 4=TONGHOP
 */
const router = createBrowserRouter([
  { path: "/",      element: <Login /> },
  { path: "/login", element: <Login /> },

  // ── Tất cả route cần đăng nhập ──
  {
    element: <ProtectedRoute />,
    children: [

      // Routes không hạn chế role (tất cả user đã login)
      { path: "/home",       element: <Home /> },
      { path: "/budget",     element: <Budget /> },

      // Transactions — tất cả role có thể truy cập trang,
      // nhưng nút hành động được ẩn/hiện theo role trong component
      { path: "/transaction",     element: <TransactionPage /> },
      { path: "/transactions/:id", element: <TransactionDetailPage /> },

      // Debt & Category & Partners — tất cả role
      { path: "/debt",      element: <DebtPage /> },
      { path: "/category",  element: <CategoryPage /> },
      { path: "/partners",  element: <PartnerPage /> },
      { path: "/documents", element: <DocumentPage /> },

      // ── Reconciliation: ADMIN(1), Kế toán Quỹ(3), Tổng hợp(4) ──
      {
        element: <RoleGuard allowedRoles={[1, 3, 4]} />,
        children: [
          { path: "/reconciliation",     element: <ReconciliationPage /> },
          { path: "/reconciliation/:id", element: <ReconciliationDetailPage /> },
        ],
      },

      // ── Fund Transfer: ADMIN(1), Kế toán Quỹ(3), Tổng hợp(4) ──
      {
        element: <RoleGuard allowedRoles={[1, 3, 4]} />,
        children: [
          { path: "/fund-transfer", element: <FundTransferPage /> },
        ],
      },

      // ── Báo cáo: ADMIN(1), Tổng hợp(4) ──
      {
        element: <RoleGuard allowedRoles={[1, 4]} />,
        children: [
          { path: "/report", element: <ReportsView /> },
        ],
      },

      // ── Quản lý người dùng: chỉ ADMIN(1) ──
      {
        element: <RoleGuard allowedRoles={[1]} />,
        children: [
          { path: "/users",              element: <UserManagementPage /> },
          { path: "/admin/userManager",  element: <UserManagementPage /> },
          { path: "/setting",            element: <UserManagementPage /> },
        ],
      },
    ],
  },
]);

export default router;
