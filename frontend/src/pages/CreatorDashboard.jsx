import { useState, useEffect } from "react";
import { requestAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/Toast";
import LoadingSkeleton from "../components/LoadingSkeleton";
import {
  Plus,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
} from "lucide-react";

const STATUS_STYLES = {
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    icon: Clock,
  },
  APPROVED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: CheckCircle,
  },
  REJECTED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    icon: XCircle,
  },
};

const CreatorDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await requestAPI.getMyRequests();
      setRequests(res.data.requests);
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await requestAPI.create(form);
      showToast("Request created successfully!", "success");
      setForm({ title: "", description: "" });
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to create request",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    approved: requests.filter((r) => r.status === "APPROVED").length,
    rejected: requests.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back,{" "}
              <span className="text-gray-400">{user?.username}</span>
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all hover:shadow-lg hover:shadow-blue-600/20"
          >
            <Plus size={18} />
            New Request
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Pending", value: stats.pending, color: "text-amber-400" },
            {
              label: "Approved",
              value: stats.approved,
              color: "text-emerald-400",
            },
            { label: "Rejected", value: stats.rejected, color: "text-red-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-8 animate-slide-up gradient-border">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-400" />
              Create New Request
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter request title (min 5 characters)"
                  required
                  minLength={5}
                  maxLength={200}
                  className="w-full px-4 py-2.5 text-sm text-white bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 placeholder-gray-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your request in detail (min 10 characters)"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm text-white bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 placeholder-gray-600 resize-y transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-400 glass rounded-xl glass-hover"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">My Requests</h2>

          {loading ? (
            <LoadingSkeleton rows={3} />
          ) : requests.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <FileText size={40} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium mb-1">No requests yet</p>
              <p className="text-sm text-gray-600">
                Click "New Request" to create your first one
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const status = STATUS_STYLES[req.status];
                const StatusIcon = status.icon;
                return (
                  <div
                    key={req.id}
                    className="glass rounded-xl p-5 glass-hover group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {req.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {req.description}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full ${status.bg} ${status.text} border ${status.border} flex-shrink-0`}
                      >
                        <StatusIcon size={12} />
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-600">
                      <span>
                        Created{" "}
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {req.updatedAt !== req.createdAt && (
                        <span>
                          Updated{" "}
                          {new Date(req.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    {req.approvalComments && (
                      <div className="mt-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MessageSquare size={12} className="text-gray-500" />
                          <span className="text-[11px] font-medium text-gray-400">
                            Approver Comments
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {req.approvalComments}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
