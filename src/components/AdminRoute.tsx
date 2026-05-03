import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, role, loading } = useAuth();

  console.log("ADMIN CHECK:", { user, role, loading });

  // Wait for auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // Wait for role
  if (role === null) {
    return <div>Loading role...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Not admin
  if (role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}