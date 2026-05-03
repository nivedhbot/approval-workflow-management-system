import { useState } from "react";
import { Menu, X, LogOut, Workflow } from "lucide-react";

const DashboardLayout = ({
  title,
  links,
  activeKey,
  onSelect,
  user,
  onLogout,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const roleLabel = (user?.role || "ROLE").toUpperCase();
  const roleClasses =
    roleLabel === "CREATOR"
      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
      : roleLabel === "APPROVER"
        ? "border-blue-200 bg-blue-100 text-blue-800"
        : "border-slate-200 bg-slate-100 text-slate-700";
  const displayName = user?.username || "User";
  const displayEmail = user?.email || "email not set";
  const displayTeam = user?.teamId || "general";

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-[#1a1a1a]">
      <div
        className={`fixed inset-0 z-30 bg-white/60 transition-opacity md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-[#e8e6e3] bg-[#fafaf9] px-4 py-5 transition-transform md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col gap-6">
          <div className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${roleClasses}`}
              >
                {roleLabel}
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-[#6b6b6b] hover:bg-[#f0efed] hover:text-[#1a1a1a] md:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-base font-semibold text-[#1a1a1a]">
              {displayName}
            </p>
            <p className="mt-1 truncate text-xs text-[#6b6b6b]">
              {displayEmail}
            </p>
            <p className="mt-2 text-xs text-[#6b6b6b]">Team: {displayTeam}</p>
            <button
              type="button"
              onClick={onLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-black"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          <div className="flex items-center justify-between md:justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#e8e6e3] bg-white px-3 py-2 shadow-sm">
              <Workflow className="h-4 w-4 text-[#2d6a4f]" />
              <span className="font-['Sora'] text-sm font-semibold">
                FlowApprove
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const active = activeKey === link.key;
              return (
                <button
                  key={link.key}
                  type="button"
                  onClick={() => {
                    onSelect(link.key);
                    setMobileOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                    active
                      ? "bg-[#2d6a4f]/10 text-[#2d6a4f] font-medium"
                      : "text-[#6b6b6b] hover:bg-[#f0efed]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto" />
        </div>
      </aside>

      <div className="md:ml-64">
        <header className="sticky top-0 z-20 border-b border-[#e8e6e3] bg-white px-4 py-4 md:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${roleClasses}`}
              >
                {roleLabel}
              </span>
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">
                  {displayName}
                </p>
                <p className="text-xs text-[#6b6b6b]">{displayEmail}</p>
                <p className="mt-1 text-xs text-[#6b6b6b]">
                  Team: {displayTeam}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-[#e8e6e3] bg-white p-2 text-[#1a1a1a]"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-black"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
          <h1 className="mt-4 font-['Sora'] text-sm font-semibold text-[#1a1a1a]">
            {title}
          </h1>
        </header>

        <main className="bg-[#f5f5f4] p-5 md:h-screen md:overflow-y-auto md:p-8">
          <div className="mb-6 hidden items-center justify-between md:flex">
            <h1 className="font-['Sora'] text-2xl font-semibold text-[#1a1a1a]">
              {title}
            </h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
