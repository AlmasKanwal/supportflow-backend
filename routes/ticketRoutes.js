const express = require("express");
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getTicketById,
  addCustomerMessage,
  cancelTicket,
} = require("../controllers/ticketController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/", protect, authorize("customer"), createTicket);
router.get("/my", protect, authorize("customer"), getMyTickets);
router.get("/:id", protect, authorize("customer"), getTicketById);
router.post("/:id/messages", protect, authorize("customer"), addCustomerMessage);
router.post("/:id/cancel", protect, authorize("customer"), cancelTicket);

module.exports = router;
