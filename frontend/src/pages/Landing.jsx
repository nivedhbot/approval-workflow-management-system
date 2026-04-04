import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Landing = () => {
  const { user } = useAuth();

  if (user) {
    const path =
      user.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/approver";
    return <Navigate to={path} replace />;
  }

  return <Navigate to="/login" replace />;
};

export default Landing;
