const Ticket = require("../models/Ticket");
const Notification = require("../models/Notification");

const VALID_PRIORITIES = ["Low", "Medium", "High"];

// @desc    Get all tickets assigned to logged-in worker
// @route   GET /api/worker/tickets
// @access  Private (worker)
const getWorkerTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ worker: req.user._id })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single ticket assigned to logged-in worker
// @route   GET /api/worker/tickets/:id
// @access  Private (worker)
const getWorkerTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("customer", "name email")
      .populate("messages.sender", "name role");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (ticket.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this ticket" });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const findOwnedTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404).json({ success: false, message: "Ticket not found" });
    return null;
  }
  if (ticket.worker.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, message: "Not authorized for this ticket" });
    return null;
  }
  return ticket;
};

// @desc    Worker accepts a pending ticket
// @route   PUT /api/worker/tickets/:id/accept
// @access  Private (worker)
const acceptTicket = async (req, res, next) => {
  try {
    const ticket = await findOwnedTicket(req, res);
    if (!ticket) return;

    if (ticket.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Only pending tickets can be accepted" });
    }

    if (ticket.accepted) {
      return res.status(400).json({ success: false, message: "This request has already been accepted" });
    }

    // Ticket stays "Pending" until the worker moves it forward, but
    // `accepted` flips to true here so the UI can hide the Accept/Reject
    // step and unlock priority + status controls.
    ticket.accepted = true;
    await ticket.save();

    await Notification.create({
      user: ticket.customer,
      message: `Your request ${ticket.ticketNumber} was accepted and will begin shortly.`,
      type: "ticket_status",
      ticket: ticket._id,
    });

    res.json({ success: true, ticket, message: "Ticket accepted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Worker rejects a pending ticket (final)
// @route   PUT /api/worker/tickets/:id/reject
// @access  Private (worker)
const rejectTicket = async (req, res, next) => {
  try {
    const ticket = await findOwnedTicket(req, res);
    if (!ticket) return;

    if (ticket.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Only pending tickets can be rejected" });
    }

    if (ticket.accepted) {
      return res.status(400).json({ success: false, message: "Cannot reject a request that was already accepted" });
    }

    ticket.status = "Rejected";
    await ticket.save();

    await Notification.create({
      user: ticket.customer,
      message: `Your request ${ticket.ticketNumber} was rejected.`,
      type: "ticket_rejected",
      ticket: ticket._id,
    });

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Worker updates ticket status (enforces status flow rules)
// @route   PUT /api/worker/tickets/:id/status
// @access  Private (worker)
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status, resolutionNote } = req.body;

    const ticket = await findOwnedTicket(req, res);
    if (!ticket) return;

    // Final states cannot be changed
    if (ticket.status === "Completed" || ticket.status === "Rejected" || ticket.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: `Ticket is already ${ticket.status} and cannot be changed`,
      });
    }

    if (!ticket.accepted) {
      return res.status(400).json({
        success: false,
        message: "You must accept this request before updating its status",
      });
    }

    const allowedTransitions = {
      Pending: ["In Progress"],
      "In Progress": ["Completed"],
    };

    if (!allowedTransitions[ticket.status] || !allowedTransitions[ticket.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move ticket from ${ticket.status} to ${status}`,
      });
    }

    if (status === "Completed") {
      if (!resolutionNote || !resolutionNote.trim()) {
        return res.status(400).json({
          success: false,
          message: "A resolution note is required to mark a ticket as Completed",
        });
      }
      ticket.resolutionNote = resolutionNote.trim();
    }

    ticket.status = status;
    await ticket.save();

    if (status === "Completed") {
      // Update worker's completed task count
      const worker = req.user;
      worker.completedTasks = (worker.completedTasks || 0) + 1;
      await worker.save();

      await Notification.create({
        user: ticket.customer,
        message: `Your service request has been completed. You can now leave a review.`,
        type: "ticket_completed",
        ticket: ticket._id,
      });
    } else {
      await Notification.create({
        user: ticket.customer,
        message: `Your request ${ticket.ticketNumber} status is now ${status}.`,
        type: "ticket_status",
        ticket: ticket._id,
      });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Worker updates ticket priority
// @route   PUT /api/worker/tickets/:id/priority
// @access  Private (worker)
const updateTicketPriority = async (req, res, next) => {
  try {
    const { priority } = req.body;

    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: "Invalid priority value" });
    }

    const ticket = await findOwnedTicket(req, res);
    if (!ticket) return;

    if (ticket.status === "Completed" || ticket.status === "Rejected" || ticket.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Cannot change priority on a final ticket" });
    }

    ticket.priority = priority;
    await ticket.save();

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Worker sends a message on a ticket
// @route   POST /api/worker/tickets/:id/messages
// @access  Private (worker)
const addWorkerMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const ticket = await findOwnedTicket(req, res);
    if (!ticket) return;

    ticket.messages.push({
      sender: req.user._id,
      senderRole: "worker",
      text: text.trim(),
    });

    await ticket.save();

    await Notification.create({
      user: ticket.customer,
      message: `New message from your worker on ticket ${ticket.ticketNumber}.`,
      type: "new_message",
      ticket: ticket._id,
    });

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkerTickets,
  getWorkerTicketById,
  acceptTicket,
  rejectTicket,
  updateTicketStatus,
  updateTicketPriority,
  addWorkerMessage,
};
