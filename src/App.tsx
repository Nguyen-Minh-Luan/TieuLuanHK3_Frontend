import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "./features/Login";
import Home from "./features/Home";
import TransactionPage from "./features/transaction/TransactionPage";
import TransactionDetail from "./features/transactionDetail/TransactionDetailPage";
import TransactionDetailPage from "./features/transactionDetail/TransactionDetailPage";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/transaction",
    element: <TransactionPage />,
  },
  {
    path: "/transactionDetail",
    element: <TransactionDetailPage />,
  },
]);

export default router;
