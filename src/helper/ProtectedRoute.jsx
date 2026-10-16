import { Navigate } from "react-router-dom";
import JWTService from "../config/jwt.config";

export default function ProtectedRoute({ children }) {

    const token = localStorage.getItem("token");   

    if (!token) {
        const path = localStorage.getItem('role')
        return <Navigate to={`/auth/login`} />;
    }

    return children;
}