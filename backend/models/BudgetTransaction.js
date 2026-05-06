const mongoose = require("mongoose");

const budgetTransactionSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    teamId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["ALLOCATED", "DISBURSED", "VOID"],
      default: "ALLOCATED",
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    allocatedAt: {
      type: Date,
      default: Date.now,
    },
    disbursedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    disbursedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

budgetTransactionSchema.index({ requestId: 1 }, { unique: true });
budgetTransactionSchema.index({ teamId: 1, status: 1 });

module.exports = mongoose.model("BudgetTransaction", budgetTransactionSchema);
