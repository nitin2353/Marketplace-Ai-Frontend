import { Navigate } from "react-router-dom";
import JWTService from "../config/jwt.config";

export default function ProtectedRoute({
    children,
    role,
    allowedRoles,
    denyRoles = [],
}) {
    const token = localStorage.getItem("token");

    // Allow public access when no role is required
    // Check token
    if (!token) {
        if (role === "admin") {
            return <Navigate to="/admin/login" replace />;
        }

        // If a specific role or allowed roles are required
        if (role || allowedRoles?.length > 0) {
            return <Navigate to="/auth/login" replace />;
        }

        // Allow public access
        return children;
    }

    // Decode token
    let decodedToken;

    try {
        decodedToken = JWTService.decodeTokenDetails(token);
    } catch (error) {
        console.error("Token decoding failed:", error);
        localStorage.removeItem("token");

        if (role) {
            return (
                <Navigate
                    to={role === "admin" ? "/admin/login" : "/auth/login"}
                    replace
                />
            );
        }

        // Invalid token is treated as logged out for public pages
        return children;
    }

    if (!decodedToken?.role) {
        localStorage.removeItem("token");

        if (role) {
            return (
                <Navigate
                    to={role === "admin" ? "/admin/login" : "/auth/login"}
                    replace
                />
            );
        }

        return children;
    }

    const userRole = decodedToken.role.toLowerCase();

    // Block specific roles
    if (denyRoles.map((r) => r.toLowerCase()).includes(userRole)) {
        return <Navigate to="/auth/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/auth/login" replace />;
    }


    // Check required role
    if (role && userRole !== role.toLowerCase()) {
        const loginPath =
            role === "admin" ? "/admin/login" : "/auth/login";

        return <Navigate to={loginPath} replace />;
    }

    return children;
}