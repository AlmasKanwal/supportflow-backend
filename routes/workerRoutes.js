const express = require("express");
const router = express.Router();
const {
  getWorkerTickets,
  getWorkerTicketById,
  acceptTicket,
  rejectTicket,
  updateTicketStatus,
  updateTicketPriority,
  addWorkerMessage,
} = require("../controllers/workerController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/tickets", protect, authorize("worker"), getWorkerTickets);
router.get("/tickets/:id", protect, authorize("worker"), getWorkerTicketById);
router.put("/tickets/:id/accept", protect, authorize("worker"), acceptTicket);
router.put("/tickets/:id/reject", protect, authorize("worker"), rejectTicket);
router.put("/tickets/:id/status", protect, authorize("worker"), updateTicketStatus);
router.put("/tickets/:id/priority", protect, authorize("worker"), updateTicketPriority);
router.post("/tickets/:id/messages", protect, authorize("worker"), addWorkerMessage);

module.exports = router;
