import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  Inbox,
  LayoutDashboard,
  Loader2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { requestAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/Toast";
import LoadingSkeleton from "../components/LoadingSkeleton";
import DashboardLayout from "../components/DashboardLayout";

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  return Math.floor(hrs / 24) + "d ago";
};

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

const ApproverDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [reviewed, setReviewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [comments, setComments] = useState({});
  const [expanded, setExpanded] = useState({});
  const [activeSection, setActiveSection] = useState("overview");
  const [reviewFilter, setReviewFilter] = useState("APPROVED");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const links = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "pending", label: "Pending", icon: Clock },
    { key: "reviewed", label: "Reviewed", icon: CheckCircle },
  ];

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await requestAPI.getPending();
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

  const fetchReviewed = async () => {
    try {
      const res = await requestAPI.getReviewed();
      setReviewed(res.data.requests || []);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to load reviewed requests",
        "error",
      );
    }
  };

  useEffect(() => {
    fetchPending();
    fetchReviewed();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = "Approver Dashboard | FlowApprove";
  }, []);

  const isSelfRequest = (request) => {
    const creatorObjId = request.creatorId?._id;
    const creatorId = request.creatorId;
    return creatorObjId === user?.id || creatorId === user?.id;
  };

  const handleAction = async (request, action) => {
    const key = `${request.id}-${action}`;
    setActionLoading(key);
    try {
      const comment = comments[request.id] || "";
      if (action === "approve") {
        await requestAPI.approve(request.id, comment);
        showToast("Request approved", "success");
      } else {
        await requestAPI.reject(request.id, comment);
        showToast("Request rejected", "info");
      }

      setComments((prev) => ({ ...prev, [request.id]: "" }));
      await fetchPending();
      await fetchReviewed();
    } catch (err) {
      showToast(
        err.response?.data?.error || `Failed to ${action} request`,
        "error",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const stats = useMemo(
    () => ({
      pending: requests.length,
      critical: requests.filter((r) => r.priority === "CRITICAL").length,
      high: requests.filter((r) => r.priority === "HIGH").length,
    }),
    [requests],
  );

  const filteredPending = useMemo(() => {
    return requests.filter((request) => {
      if (categoryFilter !== "ALL" && request.category !== categoryFilter) {
        return false;
      }
      if (priorityFilter !== "ALL" && request.priority !== priorityFilter) {
        return false;
      }
      return true;
    });
  }, [categoryFilter, priorityFilter, requests]);

  const toggleSelected = (requestId) => {
    setSelectedIds((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId],
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      await requestAPI.bulkApprove(selectedIds, comments.bulk || "");
      showToast("Requests approved", "success");
      setSelectedIds([]);
      await fetchPending();
      await fetchReviewed();
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to bulk approve requests",
        "error",
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const reviewedByMe = useMemo(
    () =>
      reviewed
        .filter((req) => (req.approverId?._id || req.approverId) === user?.id)
        .filter((req) => req.status === reviewFilter),
    [reviewFilter, reviewed, user?.id],
  );

  const handleSelectSection = (key) => {
    setActiveSection(key);
    const target = document.getElementById(key);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <DashboardLayout
      title="Approver Dashboard"
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-['Sora'] text-xl font-semibold text-[#1a1a1a]">
              You are reviewing requests for {user?.teamId || "general"} team
            </h2>
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              APPROVER
            </span>
          </div>
          <p className="mt-2 text-sm text-[#6b6b6b]">
            Prioritize urgent requests and keep your team moving.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            {
              label: "Total Pending",
              value: stats.pending,
              border: "border-l-4 border-l-amber-400",
            },
            {
              label: "Critical",
              value: stats.critical,
              border: "border-l-4 border-l-red-400",
            },
            {
              label: "High",
              value: stats.high,
              border: "border-l-4 border-l-orange-400",
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
            </div>
          ))}
        </div>
      </section>

      <section
        id="pending"
        className="mt-8 rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-6"
      >
        <h2 className="font-['Sora'] text-xl font-semibold text-[#1a1a1a]">
          Pending Requests
        </h2>
        <p className="mt-1 text-xs text-[#9b9b9b]">
          Showing requests for team: {user?.teamId || "general"}
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">
              Category
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { label: "All", value: "ALL" },
                { label: "Bug Report", value: "BUG_REPORT" },
                { label: "Server Issue", value: "SERVER_ISSUE" },
                { label: "Deadline Extension", value: "DEADLINE_EXTENSION" },
                { label: "Feature Request", value: "FEATURE_REQUEST" },
                { label: "HR Request", value: "HR_REQUEST" },
              ].map((option) => {
                const active = categoryFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCategoryFilter(option.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                      active
                        ? "border-[#2d6a4f] bg-[#2d6a4f]/10 text-[#2d6a4f]"
                        : "border-[#e8e6e3] bg-white text-[#6b6b6b] hover:bg-[#f0efed]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">
              Priority
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { label: "All", value: "ALL" },
                { label: "Critical", value: "CRITICAL" },
                { label: "High", value: "HIGH" },
                { label: "Medium", value: "MEDIUM" },
                { label: "Low", value: "LOW" },
              ].map((option) => {
                const active = priorityFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriorityFilter(option.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                      active
                        ? "border-[#2d6a4f] bg-[#2d6a4f]/10 text-[#2d6a4f]"
                        : "border-[#e8e6e3] bg-white text-[#6b6b6b] hover:bg-[#f0efed]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedIds.length > 0 ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e6e3] bg-white p-3">
              <p className="text-xs text-[#6b6b6b]">
                {selectedIds.length} selected
              </p>
              <button
                type="button"
                onClick={handleBulkApprove}
                disabled={bulkLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#40916c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bulkLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Bulk Approve Selected
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredPending.length === 0 ? (
            <div className="text-center py-16 text-[#9b9b9b]">
              <CheckCircle className="mx-auto mb-3 h-10 w-10" />
              <p className="text-sm font-medium text-[#6b6b6b]">
                All caught up — no pending requests
              </p>
              <p className="mt-2 text-xs text-[#9b9b9b]">
                New requests from your team will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPending.map((request) => {
                const creatorName = request.creator?.username || "Unknown";
                const blocked = isSelfRequest(request);
                const loadingApprove =
                  actionLoading === `${request.id}-approve`;
                const loadingReject = actionLoading === `${request.id}-reject`;
                const isExpanded = expanded[request.id];
                const isCritical = request.priority === "CRITICAL";
                const isSelected = selectedIds.includes(request.id);

                return (
                  <div
                    key={request.id}
                    className={`rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-5 ${
                      isCritical ? "border-l-4 border-l-red-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs text-[#6b6b6b]">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelected(request.id)}
                          className="h-4 w-4 rounded border-[#e8e6e3] text-[#2d6a4f] focus:ring-[#2d6a4f]"
                        />
                        Select
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {request.priority ? (
                          <span className={priorityBadge[request.priority]}>
                            {request.priority}
                          </span>
                        ) : null}
                        <span className="rounded-full border border-[#e8e6e3] bg-white px-2.5 py-1 text-xs text-[#6b6b6b]">
                          {categoryLabels[request.category] || "Other"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2d6a4f]/10 text-sm font-semibold text-[#2d6a4f]">
                        {creatorName[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a]">
                          {creatorName}
                        </p>
                        <p className="text-xs text-[#6b6b6b]">
                          submitted {timeAgo(request.createdAt)}
                        </p>
                        {request.deadline ? (
                          <p className="mt-1 text-xs text-[#9b9b9b]">
                            Due: {formatDate(request.deadline)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-[#1a1a1a]">
                      {request.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [request.id]: !prev[request.id],
                        }))
                      }
                      className={`mt-2 text-left text-sm text-[#6b6b6b] ${isExpanded ? "" : "line-clamp-2"}`}
                    >
                      {request.description}
                    </button>

                    {request.status === "PENDING" ? (
                      blocked ? (
                        <div className="flex items-center gap-2 text-yellow-600 text-sm mt-4">
                          <AlertTriangle className="w-4 h-4" />
                          <span>
                            You submitted this request — cannot action it
                          </span>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <textarea
                            rows={2}
                            value={comments[request.id] || ""}
                            onChange={(e) =>
                              setComments((prev) => ({
                                ...prev,
                                [request.id]: e.target.value,
                              }))
                            }
                            placeholder="Add a comment (optional)..."
                            className="w-full rounded-xl bg-white border border-[#e8e6e3] text-[#1a1a1a] placeholder:text-[#9b9b9b] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f]"
                          />
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => handleAction(request, "approve")}
                              disabled={loadingApprove || loadingReject}
                              className="flex items-center justify-center gap-2 rounded-xl bg-[#2d6a4f] text-white hover:bg-[#40916c] px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {loadingApprove ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(request, "reject")}
                              disabled={loadingApprove || loadingReject}
                              className="flex items-center justify-center gap-2 rounded-xl bg-red-500 text-white hover:bg-red-600 px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {loadingReject ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                              Reject
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="mt-4">
                        <div className="flex items-center gap-2">
                          <span className={statusBadge[request.status]}>
                            {request.status}
                          </span>
                          <span className="rounded-lg border border-[#2d6a4f] bg-[#2d6a4f]/10 px-2.5 py-1 text-xs text-[#2d6a4f]">
                            Actioned by you
                          </span>
                        </div>
                        {request.approvalComments ? (
                          <div className="mt-3 p-3 rounded-lg bg-white border-l-4 border-[#2d6a4f] text-sm text-[#4a4a4a]">
                            {request.approvalComments}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section
        id="reviewed"
        className="mt-8 rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-['Sora'] text-xl font-semibold text-[#1a1a1a]">
            Reviewed
          </h2>
          <div className="inline-flex rounded-xl border border-[#e8e6e3] bg-white p-1">
            {["APPROVED", "REJECTED"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setReviewFilter(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  reviewFilter === tab
                    ? "bg-[#2d6a4f]/10 text-[#2d6a4f]"
                    : "text-[#6b6b6b] hover:bg-[#f0efed]"
                }`}
              >
                {tab[0] + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {reviewedByMe.length === 0 ? (
            <div className="text-center py-12 text-[#9b9b9b]">
              <Inbox className="mx-auto mb-3 h-9 w-9" />
              <p className="text-sm font-medium text-[#6b6b6b]">
                No reviewed requests yet
              </p>
              <p className="mt-2 text-xs text-[#9b9b9b]">
                Approved or rejected requests will appear here.
              </p>
            </div>
          ) : (
            reviewedByMe.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl bg-white border border-[#e8e6e3] shadow-sm p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-[#1a1a1a]">
                    {request.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={statusBadge[request.status]}>
                      {request.status}
                    </span>
                    <span className="rounded-lg border border-[#2d6a4f] bg-[#2d6a4f]/10 px-2.5 py-1 text-xs text-[#2d6a4f]">
                      Actioned by you
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[#6b6b6b]">
                  {request.description}
                </p>
                <p className="mt-2 text-xs text-[#9b9b9b]">
                  Team: {request.teamId || "general"}
                </p>
                {request.approvalComments ? (
                  <div className="mt-3 p-3 rounded-lg bg-white border-l-4 border-[#2d6a4f] text-sm text-[#4a4a4a]">
                    {request.approvalComments}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default ApproverDashboard;
