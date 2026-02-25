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

// APPROVER only routes
router.get(
  "/pending",
  roleMiddleware(["APPROVER"]),
  requestController.getPendingRequests,
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

module.exports = router;
