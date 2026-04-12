const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { loggedin } = require("../middleware.js");
const reviewController = require("../controllers/review.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  console.log(error);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
}

router.post("/", loggedin, validateReview, wrapAsync(reviewController.post));
router.delete("/:reviewId", loggedin, wrapAsync(reviewController.delete));

module.exports = router;