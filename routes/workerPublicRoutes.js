const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { getWorkerReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// @desc    Get all active workers
// @route   GET /api/workers
// @access  Private (any logged-in user)
router.get("/", protect, async (req, res, next) => {
  try {
    const workers = await User.find({ role: "worker", isActive: true }).select(
      "name categories rating totalReviews completedTasks"
    );
    res.json({ success: true, workers });
  } catch (error) {
    next(error);
  }
});

// @desc    Get workers who offer a specific category, sorted by rating (top 3)
// @route   GET /api/workers/category/:category
// @access  Private (any logged-in user)
router.get("/category/:category", protect, async (req, res, next) => {
  try {
    const workers = await User.find({
      role: "worker",
      isActive: true,
      categories: req.params.category,
    })
      .select("name categories rating totalReviews completedTasks")
      .sort({ rating: -1 })
      .limit(3);

    res.json({ success: true, workers });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/reviews", getWorkerReviews);

module.exports = router;
