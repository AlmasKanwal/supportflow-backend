const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllCustomers,
  getAllWorkers,
  getWorkerDetails,
  getAllTickets,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/dashboard", protect, authorize("admin"), getDashboardStats);
router.get("/customers", protect, authorize("admin"), getAllCustomers);
router.get("/workers", protect, authorize("admin"), getAllWorkers);
router.get("/workers/:id", protect, authorize("admin"), getWorkerDetails);
router.get("/tickets", protect, authorize("admin"), getAllTickets);

module.exports = router;
