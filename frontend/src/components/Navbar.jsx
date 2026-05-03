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

  const roleLabel = (user?.role || "ROLE").toUpperCase();
  const roleClasses =
    roleLabel === "CREATOR"
      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
      : roleLabel === "APPROVER"
        ? "border-blue-200 bg-blue-100 text-blue-800"
        : "border-slate-200 bg-slate-100 text-slate-700";
  const displayName = user?.username || "User";
  const initial = displayName[0]?.toUpperCase() || "U";

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
          {user ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#e8e6e3] bg-white px-3 py-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2d6a4f]/10 text-sm font-semibold text-[#2d6a4f]">
                {initial}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#1a1a1a]">
                  {displayName}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${roleClasses}`}
                >
                  {roleLabel}
                </span>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
