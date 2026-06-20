import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "./features/Login";
import Home from "./features/Home";
import TransactionPage from "./features/transaction/TransactionPage";
import TransactionDetailPage from "./features/transactionDetail/TransactionDetailPage";
import UserManagement from "./features/admin/userManager/UserManagement";
import Budget from "./features/budget/Budget";
import ProtectedRoute from "./router/ProtectedRoute";
import DebtPage from "./features/debt/DebtPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  // Tất cả route dưới đây cần đăng nhập
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/home", element: <Home /> },
      { path: "/transaction", element: <TransactionPage /> },
      { path: "/transactionDetail", element: <TransactionDetailPage /> },
      { path: "/admin/userManager", element: <UserManagement /> },
      { path: "/setting", element: <UserManagement /> },
      { path: "/budget", element: <Budget /> },
      { path: "/debt", element: <DebtPage /> },
    ],
  },
]);

export default router;

