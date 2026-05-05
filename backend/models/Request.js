const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      enum: [
        "BUG_REPORT",
        "SERVER_ISSUE",
        "DEADLINE_EXTENSION",
        "FEATURE_REQUEST",
        "HR_REQUEST",
        "OTHER",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    deadline: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamId: {
      type: String,
      trim: true,
      lowercase: true,
      default: "general",
      maxlength: [50, "Team ID cannot exceed 50 characters"],
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "AUTO_REJECTED"],
      default: "PENDING",
    },
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvalComments: {
      type: String,
      maxlength: [500, "Comments cannot exceed 500 characters"],
      default: null,
    },
    requestedAmount: {
      type: Number,
      default: 0,
    },
    autoCheckStatus: {
      type: String,
      enum: [
        "PENDING_CHECK",
        "PASSED",
        "DUPLICATE",
        "AI_REJECTED",
        "BUDGET_EXCEEDED",
      ],
      default: "PENDING_CHECK",
    },
    autoCheckReason: {
      type: String,
      default: "",
    },
    autoCheckedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

requestSchema.index({ creatorId: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ teamId: 1, status: 1 });
requestSchema.index({ createdAt: -1 });
requestSchema.index({ teamId: 1, category: 1, status: 1 });
requestSchema.index({ priority: 1, createdAt: -1 });
requestSchema.index({ autoCheckStatus: 1, teamId: 1 });

module.exports = mongoose.model("Request", requestSchema);
