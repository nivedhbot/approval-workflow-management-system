import { Link, useLocation } from "react-router-dom";
import { Workflow } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (location.pathname.startsWith("/dashboard")) {
    return null;
  }

  const dashboardPath = user
    ? user.role === "CREATOR"
      ? "/dashboard/creator"
      : "/dashboard/approver"
    : "/login";

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#e8e6e3] bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to={dashboardPath} className="inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e6e3] bg-white shadow-sm">
            <Workflow className="h-4 w-4 text-[#2d6a4f]" />
          </span>
          <span className="font-['Sora'] text-base font-semibold text-[#1a1a1a]">
            FlowApprove
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl border border-[#e8e6e3] bg-white px-4 py-2 text-sm font-medium text-[#1a1a1a]/85 transition-all duration-200 hover:scale-[1.02] hover:bg-[#f0efed]"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-[#2d6a4f] text-white hover:bg-[#40916c] px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
