import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatorDashboard from "./pages/CreatorDashboard";
import ApproverDashboard from "./pages/ApproverDashboard";

function App() {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return "/login";
    return user.role === "CREATOR"
      ? "/dashboard/creator"
      : "/dashboard/approver";
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to={getDashboardPath()} replace /> : <Landing />
          }
        />
        <Route
          path="/login"
          element={
            user ? <Navigate to={getDashboardPath()} replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to={getDashboardPath()} replace /> : <Register />
          }
        />
        <Route
          path="/dashboard/creator"
          element={
            <ProtectedRoute allowedRoles={["CREATOR"]}>
              <CreatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/approver"
          element={
            <ProtectedRoute allowedRoles={["APPROVER"]}>
              <ApproverDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
