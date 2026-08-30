const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Notification = require("../models/Notification");
const generateTicketNumber = require("../utils/generateTicketNumber");

// @desc    Create a new ticket/request
// @route   POST /api/tickets
// @access  Private (customer)
const createTicket = async (req, res, next) => {
  try {
    const { description, category, workerId } = req.body;

    if (!description || !category || !workerId) {
      return res.status(400).json({ success: false, message: "Description, category and worker are required" });
    }

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== "worker") {
      return res.status(400).json({ success: false, message: "Selected worker is not valid" });
    }

    const ticketNumber = await generateTicketNumber();

    const ticket = await Ticket.create({
      ticketNumber,
      customer: req.user._id,
      worker: worker._id,
      description,
      category,
      priority: "Medium",
      status: "Pending",
    });

    await Notification.create({
      user: worker._id,
      message: `New service request assigned to you. Ticket ${ticketNumber}.`,
      type: "ticket_created",
      ticket: ticket._id,
    });

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in customer's tickets
// @route   GET /api/tickets/my
// @access  Private (customer)
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ customer: req.user._id })
      .populate("worker", "name email rating")
      .sort({ createdAt: -1 });

    res.json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single ticket by id (customer must own it)
// @route   GET /api/tickets/:id
// @access  Private (customer)
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("worker", "name email rating")
      .populate("customer", "name email")
      .populate("messages.sender", "name role");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // Ownership check - customer can only view their own tickets
    if (ticket.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this ticket" });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer sends a message on their ticket
// @route   POST /api/tickets/:id/messages
// @access  Private (customer)
const addCustomerMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (ticket.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    ticket.messages.push({
      sender: req.user._id,
      senderRole: "customer",
      text: text.trim(),
    });

    await ticket.save();

    await Notification.create({
      user: ticket.worker,
      message: `New message from customer on ticket ${ticket.ticketNumber}.`,
      type: "new_message",
      ticket: ticket._id,
    });

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer cancels their own active request
// @route   POST /api/tickets/:id/cancel
// @access  Private (customer)
const cancelTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (ticket.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (ticket.status === "Completed" || ticket.status === "Rejected" || ticket.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ticket that is already ${ticket.status}`,
      });
    }

    ticket.status = "Cancelled";
    await ticket.save();

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketById,
  addCustomerMessage,
  cancelTicket,
};
