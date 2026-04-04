import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f4]">
        <div className="flex items-center gap-3 rounded-2xl bg-white border border-[#e8e6e3] shadow-sm px-5 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2d6a4f]/30 border-t-[#2d6a4f]" />
          <span className="text-sm text-[#4a4a4a]">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirect =
      user.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/approver";
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
