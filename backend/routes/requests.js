const express = require("express");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const requestController = require("../controllers/requestController");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// CREATOR only routes
router.post("/", roleMiddleware(["CREATOR"]), requestController.createRequest);
router.get(
  "/my-requests",
  roleMiddleware(["CREATOR"]),
  requestController.getMyRequests,
);
router.put(
  "/:id/resubmit",
  roleMiddleware(["CREATOR"]),
  requestController.resubmitRequest,
);

// APPROVER only routes
router.get(
  "/pending",
  roleMiddleware(["APPROVER"]),
  requestController.getPendingRequests,
);
router.put(
  "/bulk-approve",
  roleMiddleware(["APPROVER"]),
  requestController.bulkApproveRequests,
);
router.get(
  "/reviewed",
  roleMiddleware(["APPROVER"]),
  requestController.getReviewedRequests,
);
router.get(
  "/auto-rejected",
  roleMiddleware(["APPROVER"]),
  requestController.getAutoRejectedRequests,
);
router.put(
  "/:id/approve",
  roleMiddleware(["APPROVER"]),
  requestController.approveRequest,
);
router.put(
  "/:id/reject",
  roleMiddleware(["APPROVER"]),
  requestController.rejectRequest,
);
router.put(
  "/:id/request-changes",
  roleMiddleware(["APPROVER"]),
  requestController.requestChanges,
);
router.put(
  "/:id/disburse",
  roleMiddleware(["APPROVER"]),
  requestController.disburseBudget,
);

module.exports = router;
