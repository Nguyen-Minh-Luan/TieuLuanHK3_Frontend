import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
    /** Truyền `false` khi chưa đăng nhập để redirect về /login */
    isAuthenticated: boolean;
    redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    isAuthenticated,
    redirectTo = "/login",
}) => {
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }
    return <Outlet />;
};

export default ProtectedRoute;
