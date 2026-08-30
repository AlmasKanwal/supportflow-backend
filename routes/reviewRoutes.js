const express = require("express");
const router = express.Router();
const { createReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/", protect, authorize("customer"), createReview);

module.exports = router;
