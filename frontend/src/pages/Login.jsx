import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/Toast";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const getDashboardPath = (role) =>
    role === "CREATOR" ? "/dashboard/creator" : "/dashboard/approver";

  const submitLogin = async () => {
    if (!form.email || !form.password) {
      showToast("Email and password are required", "error");
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      showToast("Welcome back", "success");
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 380);
      showToast(
        err.response?.data?.error || "Login failed. Please try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      submitLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] pt-16 text-[#1a1a1a]">
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r border-[#e8e6e3] bg-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,106,79,0.12),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(64,145,108,0.12),transparent_45%)]" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <div>
              <div className="mb-8 inline-flex items-center gap-3 rounded-2xl bg-white border border-[#e8e6e3] shadow-sm px-4 py-2">
                <Workflow className="h-5 w-5 text-[#2d6a4f]" />
                <span className="font-['Sora'] text-lg font-semibold">
                  FlowApprove
                </span>
              </div>
              <h1 className="max-w-md font-['Sora'] text-4xl font-semibold leading-tight text-[#1a1a1a]">
                Run approvals with clarity and control.
              </h1>
              <p className="mt-4 max-w-md text-base text-[#4a4a4a]">
                An enterprise workflow cockpit for teams that need velocity
                without compromising governance.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: ShieldCheck,
                  text: "Role-based access for creators and approvers",
                },
                {
                  icon: Sparkles,
                  text: "Real-time status with clean audit visibility",
                },
                {
                  icon: Lock,
                  text: "JWT secured with strict self-approval prevention",
                },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 rounded-2xl bg-white border border-[#e8e6e3] shadow-sm px-4 py-3"
                >
                  <item.icon className="h-5 w-5 text-[#2d6a4f]" />
                  <p className="text-sm text-[#4a4a4a]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div
            className={`w-full max-w-md rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-6 sm:p-8 ${shake ? "animate-shake" : ""}`}
          >
            <h2 className="font-['Sora'] text-2xl font-semibold text-[#1a1a1a]">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-[#6b6b6b]">
              Access your approval workspace.
            </p>

            <div className="mt-6 space-y-4" onKeyDown={handleKeyDown}>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="you@company.com"
                    className="w-full rounded-xl bg-white border border-[#e8e6e3] px-3 py-3 pl-10 text-sm text-[#1a1a1a] placeholder:text-[#9b9b9b] outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Enter your password"
                    className="w-full rounded-xl bg-white border border-[#e8e6e3] px-3 py-3 pl-10 pr-11 text-sm text-[#1a1a1a] placeholder:text-[#9b9b9b] outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] transition-colors hover:text-[#1a1a1a]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={submitLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d6a4f] text-white px-4 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:bg-[#40916c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-[#6b6b6b]">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-[#2d6a4f] transition-colors hover:text-[#40916c]"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
