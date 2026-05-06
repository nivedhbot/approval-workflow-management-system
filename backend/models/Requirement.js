const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    rule: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: [
        "ALL",
        "BUG_REPORT",
        "SERVER_ISSUE",
        "DEADLINE_EXTENSION",
        "FEATURE_REQUEST",
        "HR_REQUEST",
        "OTHER",
      ],
      default: "ALL",
    },
    enforcement: {
      type: String,
      enum: ["BLOCKING", "GUIDANCE"],
      default: "GUIDANCE",
    },
    tags: {
      type: [String],
      default: [],
    },
    examples: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    teamId: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

requirementSchema.index({ teamId: 1, status: 1 });
requirementSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("Requirement", requirementSchema);
