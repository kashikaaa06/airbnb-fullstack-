const express = require("express");
const router = express.Router({ mergeParams: true });  // ADD THIS
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { loggedin } = require("../middleware.js");

const validateReview= (req,res,next) => {
   let {error} = reviewSchema.validate(req.body);
  console.log(error);
  if (error) {
    let errmsg = error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400,errmsg);
  } else{
    next();
  }
}

router.post("/", loggedin, validateReview, wrapAsync(async(req,res)=> {
  let { id } = req.params;
  console.log("=== REVIEW POST DEBUG ===");
  console.log("Listing ID from params:", id);
  
  let listing = await Listing.findById(id);
  console.log("Listing found:", listing ? "Yes" : "No");
  
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  
  let newreview = new Review(req.body.review);
  newreview.author = req.user._id;

  listing.reviews.push(newreview);
  await newreview.save();
  await listing.save();
  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
}));

router.delete("/:reviewId", loggedin, wrapAsync(async(req,res)=> {
  let { id, reviewId } = req.params;
  
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;