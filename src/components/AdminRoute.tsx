import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminRoute({ children }: any) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // ❌ not logged in
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // ❌ not admin
  if (role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}