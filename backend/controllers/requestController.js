const Request = require("../models/Request");
const User = require("../models/User");
const Team = require("../models/Team");
const BudgetTransaction = require("../models/BudgetTransaction");
const autoCheckService = require("../services/autoCheckService");

const ensureTeam = async (teamId, approverId) => {
  const normalizedTeamId = teamId || "general";
  let team = await Team.findOne({ slug: normalizedTeamId });
  if (!team) {
    team = await Team.create({
      name: normalizedTeamId,
      slug: normalizedTeamId,
      totalBudget: 0,
      usedBudget: 0,
      createdBy: approverId,
    });
  }
  return team;
};

const allocateBudgetForRequest = async (requestDoc, approverId) => {
  if (!requestDoc || requestDoc.requestedAmount <= 0) {
    return null;
  }

  if (["ALLOCATED", "DISBURSED"].includes(requestDoc.budgetStatus)) {
    return null;
  }

  const teamId = requestDoc.teamId || "general";
  const team = await ensureTeam(teamId, approverId);

  const transaction = await BudgetTransaction.create({
    requestId: requestDoc._id,
    teamId,
    amount: requestDoc.requestedAmount,
    status: "ALLOCATED",
    allocatedBy: approverId,
    allocatedAt: new Date(),
  });

  team.usedBudget += requestDoc.requestedAmount;
  await team.save();

  requestDoc.budgetStatus = "ALLOCATED";
  requestDoc.allocatedAmount = requestDoc.requestedAmount;
  requestDoc.budgetTransactionId = transaction._id;
  requestDoc.budgetAllocatedAt = new Date();
  await requestDoc.save();

  return transaction;
};

// POST /api/requests
exports.createRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      deadline,
      requestedAmount,
    } = req.body;
    const allowedCategories = [
      "BUG_REPORT",
      "SERVER_ISSUE",
      "DEADLINE_EXTENSION",
      "FEATURE_REQUEST",
      "HR_REQUEST",
      "OTHER",
    ];

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: "Title and description are required",
      });
    }

    if (!category || !allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category",
      });
    }

    const creator = await User.findById(req.user.id).select(
      "teamId budgetLimit",
    );
    if (!creator) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const request = await Request.create({
      title,
      description,
      category,
      priority: priority || "MEDIUM",
      deadline: deadline || null,
      requestedAmount: requestedAmount || 0,
      creatorId: req.user.id,
      teamId: creator.teamId || "general",
    });

    const checkResult = await autoCheckService.runAutoChecks(request, creator);
    request.autoCheckStatus = checkResult.status;
    request.autoCheckReason = checkResult.reason;
    request.autoCheckedAt = new Date();
    if (!checkResult.passed) {
      request.status = "AUTO_REJECTED";
    }
    await request.save();

    res.status(201).json({
      success: true,
      message: "Request created successfully",
      request: {
        id: request._id,
        title: request.title,
        description: request.description,
        category: request.category,
        priority: request.priority,
        deadline: request.deadline,
        requestedAmount: request.requestedAmount,
        autoCheckStatus: request.autoCheckStatus,
        autoCheckReason: request.autoCheckReason,
        creatorId: request.creatorId,
        teamId: request.teamId,
        status: request.status,
        createdAt: request.createdAt,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// GET /api/requests/my-requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ creatorId: req.user.id })
      .populate("approverId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests.map((r) => ({
        id: r._id,
        title: r.title,
        description: r.description,
        teamId: r.teamId || "general",
        status: r.status,
        category: r.category,
        priority: r.priority,
        deadline: r.deadline,
        requestedAmount: r.requestedAmount,
        allocatedAmount: r.allocatedAmount,
        budgetStatus: r.budgetStatus,
        budgetAllocatedAt: r.budgetAllocatedAt,
        budgetDisbursedAt: r.budgetDisbursedAt,
        revisionComment: r.revisionComment,
        revisionRequestedAt: r.revisionRequestedAt,
        revisionRequestedBy: r.revisionRequestedBy,
        revisionCount: r.revisionCount,
        lastResubmittedAt: r.lastResubmittedAt,
        autoCheckStatus: r.autoCheckStatus,
        autoCheckReason: r.autoCheckReason,
        resolvedAt: r.resolvedAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        approvalComments: r.approvalComments,
        approverId: r.approverId,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// GET /api/requests/pending
exports.getPendingRequests = async (req, res) => {
  try {
    const approverTeamId = req.user.teamId || "general";
    const { category, priority } = req.query;
    const filter =
      approverTeamId === "general"
        ? {
            status: "PENDING",
            autoCheckStatus: "PASSED",
            $or: [
              { teamId: "general" },
              { teamId: { $exists: false } },
              { teamId: null },
              { teamId: "" },
            ],
          }
        : {
            status: "PENDING",
            autoCheckStatus: "PASSED",
            teamId: approverTeamId,
          };

    if (category) {
      filter.category = category;
    }

    if (priority) {
      filter.priority = priority;
    }

    const priorityOrder = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };

    const requests = await Request.find(filter)
      .populate("creatorId", "username email")
      .sort({ createdAt: 1 });

    const sortedRequests = requests.sort((a, b) => {
      const aPriority = priorityOrder[a.priority] ?? priorityOrder.MEDIUM;
      const bPriority = priorityOrder[b.priority] ?? priorityOrder.MEDIUM;
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.status(200).json({
      success: true,
      count: sortedRequests.length,
      requests: sortedRequests.map((r) => ({
        id: r._id,
        title: r.title,
        description: r.description,
        teamId: r.teamId || "general",
        status: r.status,
        category: r.category,
        priority: r.priority,
        deadline: r.deadline,
        autoCheckStatus: r.autoCheckStatus,
        requestedAmount: r.requestedAmount,
        creatorId: r.creatorId._id || r.creatorId,
        creator: r.creatorId.username
          ? { username: r.creatorId.username, email: r.creatorId.email }
          : null,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// GET /api/requests/reviewed
exports.getReviewedRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      approverId: req.user.id,
      status: { $in: ["APPROVED", "REJECTED"] },
    })
      .populate("approverId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests: requests.map((r) => ({
        id: r._id,
        title: r.title,
        description: r.description,
        teamId: r.teamId || "general",
        status: r.status,
        requestedAmount: r.requestedAmount,
        allocatedAmount: r.allocatedAmount,
        budgetStatus: r.budgetStatus,
        budgetAllocatedAt: r.budgetAllocatedAt,
        budgetDisbursedAt: r.budgetDisbursedAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        approvalComments: r.approvalComments,
        approverId: r.approverId,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// PUT /api/requests/:id/approve
exports.approveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const approverId = req.user.id;
    const { comments } = req.body;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    // CRITICAL: Check if request is still pending
    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        error: "This request has already been processed",
      });
    }

    // CRITICAL: Self-approval prevention
    if (request.creatorId.toString() === approverId) {
      return res.status(403).json({
        success: false,
        error: "You cannot approve your own request",
      });
    }

    const approverTeamId = req.user.teamId || "general";
    const requestTeamId = request.teamId || "general";

    if (requestTeamId !== approverTeamId) {
      return res.status(403).json({
        success: false,
        error: "You can only approve requests from your team",
      });
    }

    const updatedRequest = await Request.findOneAndUpdate(
      { _id: requestId, status: "PENDING" },
      {
        status: "APPROVED",
        approverId,
        teamId: requestTeamId,
        approvalComments: comments || "",
        resolvedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedRequest) {
      return res.status(400).json({
        success: false,
        error: "This request has already been processed",
      });
    }

    await allocateBudgetForRequest(updatedRequest, approverId);

    res.status(200).json({
      success: true,
      message: "Request approved successfully",
      request: {
        id: updatedRequest._id,
        title: updatedRequest.title,
        description: updatedRequest.description,
        teamId: updatedRequest.teamId,
        status: updatedRequest.status,
        approverId: updatedRequest.approverId,
        approvalComments: updatedRequest.approvalComments,
        updatedAt: updatedRequest.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// PUT /api/requests/:id/reject
exports.rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const approverId = req.user.id;
    const { comments } = req.body;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    // CRITICAL: Check if request is still pending
    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        error: "This request has already been processed",
      });
    }

    // CRITICAL: Self-rejection prevention
    if (request.creatorId.toString() === approverId) {
      return res.status(403).json({
        success: false,
        error: "You cannot reject your own request",
      });
    }

    const approverTeamId = req.user.teamId || "general";
    const requestTeamId = request.teamId || "general";

    if (requestTeamId !== approverTeamId) {
      return res.status(403).json({
        success: false,
        error: "You can only reject requests from your team",
      });
    }

    const updatedRequest = await Request.findOneAndUpdate(
      { _id: requestId, status: "PENDING" },
      {
        status: "REJECTED",
        approverId,
        teamId: requestTeamId,
        approvalComments: comments || "",
        resolvedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedRequest) {
      return res.status(400).json({
        success: false,
        error: "This request has already been processed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Request rejected successfully",
      request: {
        id: updatedRequest._id,
        title: updatedRequest.title,
        description: updatedRequest.description,
        teamId: updatedRequest.teamId,
        status: updatedRequest.status,
        approverId: updatedRequest.approverId,
        approvalComments: updatedRequest.approvalComments,
        updatedAt: updatedRequest.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// PUT /api/requests/:id/request-changes
exports.requestChanges = async (req, res) => {
  try {
    const requestId = req.params.id;
    const approverId = req.user.id;
    const { comments } = req.body;

    if (!comments || comments.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: "Revision comments are required",
      });
    }

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        error: "This request has already been processed",
      });
    }

    if (request.creatorId.toString() === approverId) {
      return res.status(403).json({
        success: false,
        error: "You cannot request changes on your own request",
      });
    }

    const approverTeamId = req.user.teamId || "general";
    const requestTeamId = request.teamId || "general";

    if (requestTeamId !== approverTeamId) {
      return res.status(403).json({
        success: false,
        error: "You can only request changes for your team",
      });
    }

    const updatedRequest = await Request.findOneAndUpdate(
      { _id: requestId, status: "PENDING" },
      {
        status: "REVISION_REQUIRED",
        revisionComment: comments.trim(),
        revisionRequestedAt: new Date(),
        revisionRequestedBy: approverId,
      },
      { new: true },
    );

    if (!updatedRequest) {
      return res.status(400).json({
        success: false,
        error: "This request has already been processed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Revision requested",
      request: {
        id: updatedRequest._id,
        status: updatedRequest.status,
        revisionComment: updatedRequest.revisionComment,
        revisionRequestedAt: updatedRequest.revisionRequestedAt,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// PUT /api/requests/:id/resubmit
exports.resubmitRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const {
      title,
      description,
      category,
      priority,
      deadline,
      requestedAmount,
    } = req.body;

    const allowedCategories = [
      "BUG_REPORT",
      "SERVER_ISSUE",
      "DEADLINE_EXTENSION",
      "FEATURE_REQUEST",
      "HR_REQUEST",
      "OTHER",
    ];

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: "Title and description are required",
      });
    }

    if (!category || !allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category",
      });
    }

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    if (request.creatorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "You can only resubmit your own request",
      });
    }

    if (request.status !== "REVISION_REQUIRED") {
      return res.status(400).json({
        success: false,
        error: "Only revision-required requests can be resubmitted",
      });
    }

    request.title = title;
    request.description = description;
    request.category = category;
    request.priority = priority || "MEDIUM";
    request.deadline = deadline || null;
    request.requestedAmount = requestedAmount || 0;
    request.revisionCount = (request.revisionCount || 0) + 1;
    request.lastResubmittedAt = new Date();
    request.approverId = null;
    request.approvalComments = "";
    request.resolvedAt = null;
    request.budgetStatus = "NOT_REQUESTED";
    request.allocatedAmount = 0;
    request.budgetTransactionId = null;
    request.budgetAllocatedAt = null;
    request.budgetDisbursedAt = null;

    const creator = await User.findById(req.user.id).select(
      "teamId budgetLimit",
    );
    if (!creator) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const checkResult = await autoCheckService.runAutoChecks(request, creator);
    request.autoCheckStatus = checkResult.status;
    request.autoCheckReason = checkResult.reason;
    request.autoCheckedAt = new Date();
    request.status = checkResult.passed ? "PENDING" : "AUTO_REJECTED";

    await request.save();

    res.status(200).json({
      success: true,
      message: "Request resubmitted",
      request: {
        id: request._id,
        title: request.title,
        description: request.description,
        category: request.category,
        priority: request.priority,
        deadline: request.deadline,
        requestedAmount: request.requestedAmount,
        autoCheckStatus: request.autoCheckStatus,
        autoCheckReason: request.autoCheckReason,
        status: request.status,
        revisionCount: request.revisionCount,
        lastResubmittedAt: request.lastResubmittedAt,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// PUT /api/requests/:id/disburse
exports.disburseBudget = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { notes } = req.body;
    const approverId = req.user.id;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    if (request.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        error: "Only approved requests can be disbursed",
      });
    }

    if (request.requestedAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "No budget amount to disburse",
      });
    }

    if (request.budgetStatus !== "ALLOCATED") {
      return res.status(400).json({
        success: false,
        error: "Budget must be allocated before disbursement",
      });
    }

    const approverTeamId = req.user.teamId || "general";
    const requestTeamId = request.teamId || "general";

    if (requestTeamId !== approverTeamId) {
      return res.status(403).json({
        success: false,
        error: "You can only disburse budgets for your team",
      });
    }

    const transaction = await BudgetTransaction.findOne({
      requestId: request._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Budget transaction not found",
      });
    }

    transaction.status = "DISBURSED";
    transaction.disbursedBy = approverId;
    transaction.disbursedAt = new Date();
    transaction.notes = notes || transaction.notes;
    await transaction.save();

    request.budgetStatus = "DISBURSED";
    request.budgetDisbursedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: "Budget disbursed",
      request: {
        id: request._id,
        budgetStatus: request.budgetStatus,
        budgetDisbursedAt: request.budgetDisbursedAt,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// PUT /api/requests/bulk-approve
exports.bulkApproveRequests = async (req, res) => {
  try {
    const { requestIds, comments } = req.body;

    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request IDs are required",
      });
    }

    const approverTeamId = req.user.teamId || "general";

    const result = await Request.updateMany(
      {
        _id: { $in: requestIds },
        status: "PENDING",
        teamId: approverTeamId,
      },
      {
        status: "APPROVED",
        approverId: req.user.id,
        approvalComments: comments || "",
        resolvedAt: new Date(),
      },
    );

    const approvedRequests = await Request.find({
      _id: { $in: requestIds },
      status: "APPROVED",
      teamId: approverTeamId,
    });

    for (const approvedRequest of approvedRequests) {
      await allocateBudgetForRequest(approvedRequest, req.user.id);
    }

    res.status(200).json({
      success: true,
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// GET /api/requests/auto-rejected
exports.getAutoRejectedRequests = async (req, res) => {
  try {
    const approverTeamId = req.user.teamId || "general";
    const requests = await Request.find({
      teamId: approverTeamId,
      autoCheckStatus: { $in: ["DUPLICATE", "AI_REJECTED", "BUDGET_EXCEEDED"] },
    })
      .populate("creatorId", "username email")
      .sort({ autoCheckedAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests.map((r) => ({
        id: r._id,
        title: r.title,
        category: r.category,
        priority: r.priority,
        autoCheckStatus: r.autoCheckStatus,
        autoCheckReason: r.autoCheckReason,
        autoCheckedAt: r.autoCheckedAt,
        requestedAmount: r.requestedAmount,
        creator: r.creatorId ? { username: r.creatorId.username } : null,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};
