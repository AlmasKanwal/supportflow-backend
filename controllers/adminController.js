const User = require("../models/User");
const Ticket = require("../models/Ticket");

// @desc    Admin dashboard summary statistics
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalWorkers = await User.countDocuments({ role: "worker" });
    const totalRequests = await Ticket.countDocuments();
    const completedRequests = await Ticket.countDocuments({ status: "Completed" });
    const pendingRequests = await Ticket.countDocuments({ status: "Pending" });
    const rejectedRequests = await Ticket.countDocuments({ status: "Rejected" });

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalWorkers,
        totalRequests,
        completedRequests,
        pendingRequests,
        rejectedRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private (admin)
const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: "customer" }).sort({ createdAt: -1 });
    res.json({ success: true, customers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all workers
// @route   GET /api/admin/workers
// @access  Private (admin)
const getAllWorkers = async (req, res, next) => {
  try {
    const workers = await User.find({ role: "worker" }).sort({ createdAt: -1 });
    res.json({ success: true, workers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single worker with their task history
// @route   GET /api/admin/workers/:id
// @access  Private (admin)
const getWorkerDetails = async (req, res, next) => {
  try {
    const worker = await User.findById(req.params.id);
    if (!worker || worker.role !== "worker") {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    const tickets = await Ticket.find({ worker: worker._id })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, worker, tickets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets/requests
// @route   GET /api/admin/tickets
// @access  Private (admin)
const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
      .populate("customer", "name email")
      .populate("worker", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllCustomers,
  getAllWorkers,
  getWorkerDetails,
  getAllTickets,
};
