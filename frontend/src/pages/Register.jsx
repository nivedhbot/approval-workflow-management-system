import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
  Users,
  Workflow,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/Toast";

const getPasswordStrength = (password) => {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const longEnough = password.length >= 8;
  const score = [hasLower, hasUpper, hasNumber, hasSpecial, longEnough].filter(
    Boolean,
  ).length;

  if (score <= 2) return { level: "Weak", color: "bg-red-500", width: "w-1/3" };
  if (score <= 4)
    return { level: "Medium", color: "bg-yellow-500", width: "w-2/3" };
  return { level: "Strong", color: "bg-green-500", width: "w-full" };
};

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "CREATOR",
    teamId: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password],
  );

  const getDashboardPath = (role) =>
    role === "CREATOR" ? "/dashboard/creator" : "/dashboard/approver";

  const submitRegistration = async () => {
    if (!form.username || !form.email || !form.password || !form.role) {
      showToast("All fields are required", "error");
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        ...form,
        teamId: form.teamId.trim() || "general",
      });
      showToast("Account created successfully", "success");
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (err) {
      showToast(
        err.response?.data?.error || "Registration failed. Please try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      submitRegistration();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] pt-16 text-[#1a1a1a]">
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r border-[#e8e6e3] bg-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(45,106,79,0.12),transparent_55%),radial-gradient(circle_at_85%_75%,rgba(64,145,108,0.12),transparent_50%)]" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <div>
              <div className="mb-8 inline-flex items-center gap-3 rounded-2xl bg-white border border-[#e8e6e3] shadow-sm px-4 py-2">
                <Workflow className="h-5 w-5 text-[#2d6a4f]" />
                <span className="font-['Sora'] text-lg font-semibold">
                  FlowApprove
                </span>
              </div>
              <h1 className="max-w-lg font-['Sora'] text-4xl font-semibold leading-tight text-[#1a1a1a]">
                Build trustworthy approvals across teams.
              </h1>
              <p className="mt-4 max-w-md text-base text-[#4a4a4a]">
                Register once and move requests through a secure
                creator-approver lifecycle with full visibility.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-4">
                <p className="text-sm text-[#4a4a4a]">
                  Fast onboarding for both request creators and decision
                  approvers.
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-4">
                <p className="text-sm text-[#4a4a4a]">
                  Every action is role-validated and routed through protected
                  APIs.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-6 sm:p-8">
            <h2 className="font-['Sora'] text-2xl font-semibold text-[#1a1a1a]">
              Create account
            </h2>
            <p className="mt-2 text-sm text-[#6b6b6b]">
              Join as a creator or approver.
            </p>

            <div className="mt-6 space-y-4" onKeyDown={handleKeyDown}>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">
                  Username
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, username: e.target.value }))
                    }
                    maxLength={50}
                    placeholder="john.doe"
                    className="w-full rounded-xl bg-white border border-[#e8e6e3] px-3 py-3 pl-10 text-sm text-[#1a1a1a] placeholder:text-[#9b9b9b] outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

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
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl bg-white border border-[#e8e6e3] px-3 py-3 pl-10 text-sm text-[#1a1a1a] placeholder:text-[#9b9b9b] outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
                  />
                </div>
                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0efed]">
                    <div
                      className={`h-full ${passwordStrength.width} ${passwordStrength.color} transition-all duration-200`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#6b6b6b]">
                    Strength: {form.password ? passwordStrength.level : "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">
                  Role
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, role: "CREATOR" }))
                    }
                    className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] ${
                      form.role === "CREATOR"
                        ? "border-[#2d6a4f] bg-[#2d6a4f]/10"
                        : "border-[#e8e6e3] bg-white"
                    }`}
                  >
                    <UserPlus className="h-5 w-5 text-[#2d6a4f]" />
                    <h3 className="mt-3 font-['Sora'] text-base font-semibold text-[#1a1a1a]">
                      Creator
                    </h3>
                    <p className="mt-1 text-sm text-[#6b6b6b]">
                      Submit approval requests
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, role: "APPROVER" }))
                    }
                    className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] ${
                      form.role === "APPROVER"
                        ? "border-[#2d6a4f] bg-[#2d6a4f]/10"
                        : "border-[#e8e6e3] bg-white"
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5 text-[#2d6a4f]" />
                    <h3 className="mt-3 font-['Sora'] text-base font-semibold text-[#1a1a1a]">
                      Approver
                    </h3>
                    <p className="mt-1 text-sm text-[#6b6b6b]">
                      Review and action requests
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">
                  Team ID
                </label>
                <div className="relative">
                  <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
                  <input
                    type="text"
                    value={form.teamId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, teamId: e.target.value }))
                    }
                    maxLength={50}
                    placeholder="finance-north"
                    className="w-full rounded-xl bg-white border border-[#e8e6e3] px-3 py-3 pl-10 text-sm text-[#1a1a1a] placeholder:text-[#9b9b9b] outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
                  />
                </div>
                <p className="mt-1 text-xs text-[#9b9b9b]">
                  Optional. Leave blank to use the default team: general.
                </p>
              </div>

              <button
                type="button"
                onClick={submitRegistration}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d6a4f] text-white px-4 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:bg-[#40916c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-[#6b6b6b]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#2d6a4f] transition-colors hover:text-[#40916c]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
