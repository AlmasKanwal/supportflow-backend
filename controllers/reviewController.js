const Review = require("../models/Review");
const Ticket = require("../models/Ticket");
const User = require("../models/User");

// @desc    Customer submits a review for a completed ticket
// @route   POST /api/reviews
// @access  Private (customer)
const createReview = async (req, res, next) => {
  try {
    const { ticketId, rating, comment } = req.body;

    if (!ticketId || !rating) {
      return res.status(400).json({ success: false, message: "Ticket and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (ticket.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to review this ticket" });
    }

    if (ticket.status !== "Completed") {
      return res.status(400).json({ success: false, message: "You can only review a completed request" });
    }

    const existingReview = await Review.findOne({ ticket: ticketId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "This ticket has already been reviewed" });
    }

    const review = await Review.create({
      customer: req.user._id,
      worker: ticket.worker,
      ticket: ticketId,
      rating,
      comment: comment || "",
    });

    ticket.review = review._id;
    await ticket.save();

    // Recalculate worker's average rating
    const worker = await User.findById(ticket.worker);
    const allReviews = await Review.find({ worker: ticket.worker });
    const total = allReviews.reduce((sum, r) => sum + r.rating, 0);
    worker.rating = Number((total / allReviews.length).toFixed(1));
    worker.totalReviews = allReviews.length;
    await worker.save();

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a worker
// @route   GET /api/workers/:id/reviews
// @access  Public
const getWorkerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ worker: req.params.id })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getWorkerReviews };
