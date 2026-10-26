import { Navigate } from "react-router-dom";
import JWTService from "../config/jwt.config";

export default function ProtectedRoute({
    children,
    role,
    allowedRoles,
    denyRoles = [],
    guestOnly = false,
}) {
    const token = localStorage.getItem("token");

    // No token
    if (!token) {
        if (role === "admin") {
            return <Navigate to="/admin/login" replace />;
        }

        if (role || allowedRoles?.length > 0) {
            return <Navigate to="/auth/login" replace />;
        }

        // Public pages and login page
        return children;
    }

    // Decode token
    let decodedToken;


    try {
        decodedToken = JWTService.decodeTokenDetails(token);

        console.log("location.href",location.pathname)
        if(decodedToken.role == 'admin' && location.pathname == '/auth/login'){
            return <Navigate to="/admin/login" replace />
        }

    } catch (error) {
        console.error("Token decoding failed:", error);
        localStorage.removeItem("token");

        if (role) {
            return (
                <Navigate
                    to={role.toLowerCase() === "admin"
                        ? "/admin/login"
                        : "/auth/login"}
                    replace
                />
            );
        }

        return children;
    }

    // Invalid token role
    if (!decodedToken?.role) {
        localStorage.removeItem("token");

        if (role) {
            return (
                <Navigate
                    to={role.toLowerCase() === "admin"
                        ? "/admin/login"
                        : "/auth/login"}
                    replace
                />
            );
        }

        return children;
    }

    const userRole = decodedToken.role.toLowerCase();

    // Redirect authenticated users away from login page
    if (guestOnly) {
        switch (userRole) {
            case "seller":
                return <Navigate to="/seller/dashboard" replace />;

            case "customer":
                return <Navigate to="/" replace />;

            default:
                return children;
        }
    }

    // Block specific roles
    if (denyRoles.map((r) => r.toLowerCase()).includes(userRole)) {
        return <Navigate to="/auth/login" replace />;
    }

    // Check allowed roles
    if (
        allowedRoles &&
        !allowedRoles.map((r) => r.toLowerCase()).includes(userRole)
    ) {
        return <Navigate to="/auth/login" replace />;
    }

    // Check required role
    if (role && userRole !== role.toLowerCase()) {
        const loginPath =
            role.toLowerCase() === "admin"
                ? "/admin/login"
                : "/auth/login";

        return <Navigate to={loginPath} replace />;
    }

    return children;
}