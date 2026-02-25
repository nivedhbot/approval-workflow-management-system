import { useState, useEffect } from "react";
import { requestAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/Toast";
import LoadingSkeleton from "../components/LoadingSkeleton";
import {
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  MessageSquare,
  Loader2,
  Inbox,
  User,
} from "lucide-react";

const ApproverDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [comments, setComments] = useState({});

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await requestAPI.getPending();
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
    fetchPending();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComment = (id, value) => {
    setComments((prev) => ({ ...prev, [id]: value }));
  };

  const canApprove = (req) => {
    const creatorId = req.creatorId?._id || req.creatorId;
    return creatorId?.toString() !== user?.id;
  };

  const handleAction = async (id, action) => {
    setActionLoading(`${id}-${action}`);
    try {
      if (action === "approve") {
        await requestAPI.approve(id, comments[id] || "");
        showToast("Request approved successfully!", "success");
      } else {
        await requestAPI.reject(id, comments[id] || "");
        showToast("Request rejected.", "info");
      }
      setComments((prev) => ({ ...prev, [id]: "" }));
      fetchPending();
    } catch (err) {
      showToast(
        err.response?.data?.error || `Failed to ${action} request`,
        "error",
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Approver Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back,{" "}
            <span className="text-gray-400">{user?.username}</span>
            <span className="mx-2 text-gray-700">·</span>
            <span className="text-amber-400/80">{requests.length} pending</span>
          </p>
        </div>

        {/* Requests */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-amber-400" />
            Pending Requests
          </h2>

          {loading ? (
            <LoadingSkeleton rows={3} />
          ) : requests.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Inbox size={40} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium mb-1">All clear!</p>
              <p className="text-sm text-gray-600">
                No pending requests at this time
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const isOwn = !canApprove(req);
                return (
                  <div
                    key={req.id}
                    className={`glass rounded-xl p-5 transition-all ${
                      isOwn ? "opacity-60" : "glass-hover"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white">
                          {req.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {req.description}
                        </p>
                      </div>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex-shrink-0">
                        <Clock size={12} />
                        PENDING
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-600">
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        {req.creator?.username || "Unknown"}
                      </span>
                      <span>{req.creator?.email || ""}</span>
                      <span>
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Actions */}
                    {isOwn ? (
                      <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-amber-500/[0.04] border border-amber-500/10">
                        <ShieldAlert
                          size={16}
                          className="text-amber-400 flex-shrink-0"
                        />
                        <p className="text-xs text-amber-400/80">
                          You cannot approve your own request
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {/* Comment input */}
                        <div className="relative">
                          <MessageSquare
                            size={14}
                            className="absolute left-3 top-3 text-gray-600"
                          />
                          <textarea
                            placeholder="Add comments (optional)"
                            value={comments[req.id] || ""}
                            onChange={(e) =>
                              handleComment(req.id, e.target.value)
                            }
                            maxLength={500}
                            rows={2}
                            className="w-full pl-9 pr-4 py-2 text-xs text-white bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 placeholder-gray-600 resize-none transition-colors"
                          />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(req.id, "approve")}
                            disabled={actionLoading === `${req.id}-approve`}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {actionLoading === `${req.id}-approve` ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(req.id, "reject")}
                            disabled={actionLoading === `${req.id}-reject`}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {actionLoading === `${req.id}-reject` ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <XCircle size={14} />
                            )}
                            Reject
                          </button>
                        </div>
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

export default ApproverDashboard;
