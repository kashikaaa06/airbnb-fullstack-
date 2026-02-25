const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

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

router.post("/:id/reviews", validateReview,wrapAsync( async(req,res)=> {
  let listing = await Listing.findById(req.params.id);
  let newreview = new Review(req.body.review);
  listing.reviews.push(newreview);
  await newreview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
}));

router.delete("/:id/reviews/:reviewId", wrapAsync(async(req,res)=> {
  let { id, reviewId } = req.params; 
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}));

module.exports = router;