import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    // 🔥 WAIT until auth is loaded
    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            Loading...
        </div>; // or spinner
    }

    // 🔒 If not logged in
    if (!user) {
        return <Navigate to="/auth" />;
    }

    return children;
}