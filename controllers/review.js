const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.post = async (req, res) => {
  let { id } = req.params;
  
  let listing = await Listing.findById(id);
  
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
};

module.exports.delete = async (req, res) => {
  let { id, reviewId } = req.params;
  
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};