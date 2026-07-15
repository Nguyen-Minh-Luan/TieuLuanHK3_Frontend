import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/useAppDispatch";
import { ROLE_ALLOWED_ROUTES } from "../lib/permissions";

interface RoleGuardProps {
  /** Danh sách role number được phép truy cập route này */
  allowedRoles: number[];
}

/**
 * RoleGuard — Bọc quanh các route nhạy cảm.
 * Nếu role hiện tại không nằm trong allowedRoles → redirect về /home.
 * Đây là lớp bảo vệ UI; phân quyền thực sự do backend enforce.
 */
const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const role  = useAppSelector((state) => state.auth.role);
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  // Chưa đăng nhập → về trang login (ProtectedRoute đã xử lý nhưng giữ đây để an toàn)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role không hợp lệ hoặc không trong danh sách được phép → về Home
  if (role === null || !allowedRoles.includes(role)) {
    return <Navigate to="/home" replace state={{ from: location, reason: "INSUFFICIENT_ROLE" }} />;
  }

  return <Outlet />;
};

export default RoleGuard;
