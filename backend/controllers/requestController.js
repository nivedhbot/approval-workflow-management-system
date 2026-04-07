const Request = require("../models/Request");
const User = require("../models/User");

// POST /api/requests
exports.createRequest = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: "Title and description are required",
      });
    }

    const creator = await User.findById(req.user.id).select("teamId");
    if (!creator) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const request = await Request.create({
      title,
      description,
      creatorId: req.user.id,
      teamId: creator.teamId || "general",
    });

    res.status(201).json({
      success: true,
      message: "Request created successfully",
      request: {
        id: request._id,
        title: request.title,
        description: request.description,
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
    const filter =
      approverTeamId === "general"
        ? {
            status: "PENDING",
            $or: [
              { teamId: "general" },
              { teamId: { $exists: false } },
              { teamId: null },
              { teamId: "" },
            ],
          }
        : { status: "PENDING", teamId: approverTeamId };

    const requests = await Request.find(filter)
      .populate("creatorId", "username email")
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

// PUT /api/requests/:id/approve
exports.approveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const approverId = req.user.id;
    const { comments } = req.body;

    // Find the request
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

    // Update request
    request.status = "APPROVED";
    request.approverId = approverId;
    request.teamId = requestTeamId;
    request.approvalComments = comments || "";
    await request.save();

    res.status(200).json({
      success: true,
      message: "Request approved successfully",
      request: {
        id: request._id,
        title: request.title,
        description: request.description,
        teamId: request.teamId,
        status: request.status,
        approverId: request.approverId,
        approvalComments: request.approvalComments,
        updatedAt: request.updatedAt,
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

    // Find the request
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

    // Update request
    request.status = "REJECTED";
    request.approverId = approverId;
    request.teamId = requestTeamId;
    request.approvalComments = comments || "";
    await request.save();

    res.status(200).json({
      success: true,
      message: "Request rejected successfully",
      request: {
        id: request._id,
        title: request.title,
        description: request.description,
        teamId: request.teamId,
        status: request.status,
        approverId: request.approverId,
        approvalComments: request.approvalComments,
        updatedAt: request.updatedAt,
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
