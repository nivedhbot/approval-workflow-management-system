import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Inbox,
  LayoutDashboard,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { requestAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/Toast";
import LoadingSkeleton from "../components/LoadingSkeleton";
import DashboardLayout from "../components/DashboardLayout";

const statusBadge = {
  PENDING:
    "rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700",
  APPROVED:
    "rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700",
  REJECTED:
    "rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700",
};

const priorityBadge = {
  CRITICAL:
    "rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700",
  HIGH: "rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700",
  MEDIUM:
    "rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700",
  LOW: "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600",
};

const categoryLabels = {
  BUG_REPORT: "Bug Report",
  SERVER_ISSUE: "Server Issue",
  DEADLINE_EXTENSION: "Deadline Extension",
  FEATURE_REQUEST: "Feature Request",
  HR_REQUEST: "HR Request",
  OTHER: "Other",
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  return Math.floor(hrs / 24) + "d ago";
};

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState({ title: "", description: "" });

  const links = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "new-request", label: "New Request", icon: PlusCircle },
    { key: "my-requests", label: "My Requests", icon: ClipboardList },
  ];

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await requestAPI.getMyRequests();
      setRequests(res.data.requests || []);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to load requests",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = "Creator Dashboard | FlowApprove";
  }, []);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
    }),
    [requests],
  );
  const allZero = stats.total === 0;

  const filteredRequests = useMemo(() => {
    if (filter === "ALL") return requests;
    return requests.filter((req) => req.status === filter);
  }, [filter, requests]);

  const submitRequest = async () => {
    if (!form.title || !form.description) {
      showToast("Title and description are required", "error");
      return;
    }

    setSubmitting(true);
    try {
      await requestAPI.create(form);
      showToast("Request created successfully", "success");
      setForm({ title: "", description: "" });
      await fetchRequests();
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to create request",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectSection = (key) => {
    setActiveSection(key);
    const target = document.getElementById(key);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <DashboardLayout
      title="Creator Dashboard"
      links={links}
      activeKey={activeSection}
      onSelect={handleSelectSection}
      user={user}
      onLogout={() => {
        logout();
        navigate("/login");
      }}
    >
      <section id="overview" className="space-y-6">
        <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-[#9b9b9b]">
            Overview
          </p>
          <h2 className="mt-2 font-['Sora'] text-2xl font-semibold text-[#1a1a1a]">
            Welcome, {user?.username || "User"}
          </h2>
          <p className="mt-1 text-sm text-[#6b6b6b]">
            Submit requests for your team approver to review.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total",
              value: stats.total,
              border: "border-l-4 border-l-[#2d6a4f]",
            },
            {
              label: "Pending",
              value: stats.pending,
              border: "border-l-4 border-l-amber-400",
            },
            {
              label: "Approved",
              value: stats.approved,
              border: "border-l-4 border-l-green-400",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              border: "border-l-4 border-l-red-400",
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-6 ${card.border}`}
            >
              <p className="text-sm text-[#6b6b6b]">{card.label}</p>
              <p className="mt-2 font-['Sora'] text-3xl font-semibold text-[#1a1a1a]">
                {card.value}
              </p>
              {allZero && card.label === "Total" ? (
                <p className="mt-3 text-xs text-[#9b9b9b]">
                  Create your first request to get started.
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section
        id="new-request"
        className="mt-8 rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-6"
      >
        <h2 className="font-['Sora'] text-xl font-semibold text-[#1a1a1a]">
          New Request
        </h2>
        <p className="mt-1 text-sm text-[#6b6b6b]">
          Submit approval requests with clear context.
        </p>
        <p className="mt-1 text-xs text-[#9b9b9b]">
          This request is routed to team: {user?.teamId || "general"}
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">
                Title
              </label>
              <span className="text-xs text-[#9b9b9b]">
                {form.title.length}/200
              </span>
            </div>
            <input
              type="text"
              value={form.title}
              maxLength={200}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full rounded-xl bg-white border border-[#e8e6e3] text-[#1a1a1a] placeholder:text-[#9b9b9b] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
              placeholder="Budget variance request for Q3"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">
                Description
              </label>
              <span className="text-xs text-[#9b9b9b]">
                {form.description.length}/2000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={2000}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full rounded-xl bg-white border border-[#e8e6e3] text-[#1a1a1a] placeholder:text-[#9b9b9b] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
              placeholder="Summarize the request and expected impact"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full rounded-xl bg-white border border-[#e8e6e3] text-[#1a1a1a] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
              >
                <option value="BUG_REPORT">Bug Report</option>
                <option value="SERVER_ISSUE">Server Issue</option>
                <option value="DEADLINE_EXTENSION">Deadline Extension</option>
                <option value="FEATURE_REQUEST">Feature Request</option>
                <option value="HR_REQUEST">HR Request</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">
                Deadline (optional)
              </label>
              <input
                type="date"
                value={form.deadline || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    deadline: e.target.value || null,
                  }))
                }
                className="w-full rounded-xl bg-white border border-[#e8e6e3] text-[#1a1a1a] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  value: "LOW",
                  label: "LOW",
                  classes: "border-slate-200 text-slate-600 hover:bg-slate-50",
                  active: "bg-slate-100",
                },
                {
                  value: "MEDIUM",
                  label: "MEDIUM",
                  classes: "border-blue-200 text-blue-700 hover:bg-blue-50",
                  active: "bg-blue-100",
                },
                {
                  value: "HIGH",
                  label: "HIGH",
                  classes:
                    "border-orange-200 text-orange-700 hover:bg-orange-50",
                  active: "bg-orange-100",
                },
                {
                  value: "CRITICAL",
                  label: "CRITICAL",
                  classes: "border-red-200 text-red-700 hover:bg-red-50",
                  active: "bg-red-100",
                },
              ].map((option) => {
                const active = form.priority === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, priority: option.value }))
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ${option.classes} ${
                      active ? option.active : "bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={submitRequest}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] text-white hover:bg-[#40916c] px-5 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </section>

      <section
        id="my-requests"
        className="mt-8 rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-['Sora'] text-xl font-semibold text-[#1a1a1a]">
            My Requests
          </h2>
          <div className="inline-flex rounded-xl border border-[#e8e6e3] bg-white p-1">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  filter === tab
                    ? "bg-[#2d6a4f]/10 text-[#2d6a4f]"
                    : "text-[#6b6b6b] hover:bg-[#f0efed]"
                }`}
              >
                {tab === "ALL" ? "All" : tab[0] + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 text-[#9b9b9b]">
              <Inbox className="mx-auto mb-3 h-10 w-10" />
              <p className="text-sm font-medium text-[#6b6b6b]">
                No requests yet
              </p>
              <p className="mt-2 text-xs text-[#9b9b9b]">
                Create a request to start the approval flow.
              </p>
              <button
                type="button"
                onClick={() => handleSelectSection("new-request")}
                className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#40916c]"
              >
                <PlusCircle className="h-4 w-4" />
                New Request
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedRequests.map((request) => {
                const isExpanded = expanded[request.id];
                return (
                  <div
                    key={request.id}
                    className="rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-[#1a1a1a]">
                        {request.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={statusBadge[request.status]}>
                          {request.status}
                        </span>
                        {request.priority ? (
                          <span className={priorityBadge[request.priority]}>
                            {request.priority}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#6b6b6b]">
                      <span className="rounded-full border border-[#e8e6e3] bg-white px-2.5 py-1">
                        {categoryLabels[request.category] || "Other"}
                      </span>
                      {request.deadline ? (
                        <span className="rounded-full border border-[#e8e6e3] bg-white px-2.5 py-1">
                          Due: {formatDate(request.deadline)}
                        </span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [request.id]: !prev[request.id],
                        }))
                      }
                      className={`mt-3 text-left text-sm text-[#6b6b6b] ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {request.description}
                    </button>

                    <div className="mt-3 text-xs text-[#9b9b9b]">
                      Team: {request.teamId || user?.teamId || "general"}
                    </div>

                    <div className="mt-1 text-xs text-[#9b9b9b]">
                      Created {timeAgo(request.createdAt)}
                    </div>

                    {(request.status === "APPROVED" ||
                      request.status === "REJECTED") &&
                    request.resolvedAt ? (
                      <div className="mt-1 text-xs text-[#9b9b9b]">
                        Resolved {timeAgo(request.resolvedAt)}
                      </div>
                    ) : null}

                    {(request.status === "APPROVED" ||
                      request.status === "REJECTED") &&
                    request.approvalComments ? (
                      <div className="mt-3 p-3 rounded-lg bg-white border-l-4 border-[#2d6a4f] text-sm text-[#4a4a4a]">
                        <p className="mb-1 text-xs uppercase tracking-wide text-[#40916c]">
                          {(request.approverId &&
                            request.approverId.username) ||
                            "Approver"}
                        </p>
                        <p>{request.approvalComments}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default CreatorDashboard;
