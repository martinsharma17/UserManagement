import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.some((r) => user.roles?.includes(r))) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;

