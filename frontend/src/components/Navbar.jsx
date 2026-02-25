import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Menu,
  X,
  Workflow,
  LayoutDashboard,
  FileText,
  Clock,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isLanding = location.pathname === "/";

  const scrollToSection = (id) => {
    if (!isLanding) {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-dark/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
              <Workflow size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Flow<span className="gradient-text">Approve</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!user ? (
              <>
                <button
                  onClick={() => scrollToSection("features")}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection("security")}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                >
                  Security
                </button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all hover:shadow-lg hover:shadow-blue-500/25"
                >
                  Get Started
                </Link>
              </>
            ) : user.role === "CREATOR" ? (
              <>
                <Link
                  to="/dashboard/creator"
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                    location.pathname === "/dashboard/creator"
                      ? "text-white bg-white/[0.06]"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link
                  to="/dashboard/creator"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  <FileText size={16} /> My Requests
                </Link>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 bg-white/[0.04] px-2.5 py-1 rounded-full">
                    {user.username} · Creator
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/[0.06] transition-colors"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard/approver"
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                    location.pathname === "/dashboard/approver"
                      ? "text-white bg-white/[0.06]"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link
                  to="/dashboard/approver"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  <Clock size={16} /> Pending Requests
                </Link>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 bg-white/[0.04] px-2.5 py-1 rounded-full">
                    {user.username} · Approver
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/[0.06] transition-colors"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/[0.06] animate-fade-in">
            <div className="flex flex-col gap-1">
              {!user ? (
                <>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="text-left px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="text-left px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => scrollToSection("security")}
                    className="text-left px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                  >
                    Security
                  </button>
                  <div className="h-px bg-white/[0.06] my-2" />
                  <Link
                    to="/login"
                    className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="mx-4 py-2.5 text-sm font-medium text-center text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={
                      user.role === "CREATOR"
                        ? "/dashboard/creator"
                        : "/dashboard/approver"
                    }
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <div className="h-px bg-white/[0.06] my-2" />
                  <span className="px-4 py-2 text-xs text-gray-500">
                    {user.username} · {user.role}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/[0.06] rounded-lg transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
