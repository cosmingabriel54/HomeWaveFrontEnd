import { Navigate, useLocation } from "react-router-dom";
import {JSX} from "react";

interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const location = useLocation();
    const uuid = localStorage.getItem("uuid");

    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

    if (!uuid && !isAuthPage) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
