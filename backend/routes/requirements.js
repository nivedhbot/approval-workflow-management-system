const express = require("express");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const requirementsController = require("../controllers/requirementsController");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  roleMiddleware(["APPROVER", "CREATOR"]),
  requirementsController.listRequirements,
);

router.post(
  "/",
  roleMiddleware(["APPROVER"]),
  requirementsController.createRequirement,
);

router.put(
  "/:id",
  roleMiddleware(["APPROVER"]),
  requirementsController.updateRequirement,
);

router.delete(
  "/:id",
  roleMiddleware(["APPROVER"]),
  requirementsController.deleteRequirement,
);

module.exports = router;
