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
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  APPROVED: "bg-green-50 text-green-700 border border-green-200",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
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

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
    }),
    [requests],
  );

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
              <p>No requests here yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
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
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${statusBadge[request.status]}`}
                      >
                        {request.status}
                      </span>
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
                      Created {timeAgo(request.createdAt)}
                    </div>

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
