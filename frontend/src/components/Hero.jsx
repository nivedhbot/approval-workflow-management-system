import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const DashboardPreview = () => (
  <div className="relative w-full max-w-md mx-auto animate-float">
    {/* Glow behind */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl blur-3xl scale-110" />

    <div className="relative glass rounded-2xl overflow-hidden gradient-border">
      {/* Mini Navbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-indigo-600" />
          <span className="text-xs font-semibold text-white/80">
            FlowApprove
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            Recent Requests
          </span>
          <span className="text-[10px] text-blue-400 font-medium">
            View All →
          </span>
        </div>

        {/* Request Item 1 */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
          <div>
            <p className="text-xs font-medium text-white/90">
              Budget Approval Q3
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Marketing Department
            </p>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
            PENDING
          </span>
        </div>

        {/* Request Item 2 */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div>
            <p className="text-xs font-medium text-white/90">
              New Hire Onboarding
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Engineering Team</p>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            APPROVED
          </span>
        </div>

        {/* Request Item 3 */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div>
            <p className="text-xs font-medium text-white/90">
              Travel Reimbursement
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Finance Review</p>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
            REJECTED
          </span>
        </div>

        {/* Action Bar */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600/80 to-indigo-600/80 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-white">
              + New Request
            </span>
          </div>
          <div className="h-8 w-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
            <span className="text-[10px]">⚡</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background Orbs */}
      <div className="orb w-[500px] h-[500px] bg-blue-600 top-1/4 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-indigo-600 bottom-1/4 -right-32" />
      <div className="orb w-[300px] h-[300px] bg-purple-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-gray-300">
              <Sparkles size={14} className="text-blue-400" />
              <span>Production-Ready Approval Engine</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-balance">
                Secure Approval <span className="gradient-text">Workflows</span>{" "}
                Built for Real Teams
              </h1>
              <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                Create requests, manage approvals, and enforce ownership rules
                with JWT-secured workflows. Role-based access, database
                persistence, and real-time status tracking.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-300 glass rounded-xl glass-hover hover:-translate-y-0.5"
              >
                Login
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    "bg-blue-500",
                    "bg-indigo-500",
                    "bg-purple-500",
                    "bg-pink-500",
                  ].map((color, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-full ${color} border-2 border-dark flex items-center justify-center text-[10px] font-bold text-white`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  Teams using FlowApprove
                </span>
              </div>
            </div>
          </div>

          {/* Right Column – Dashboard Preview */}
          <div
            className="hidden lg:block animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
