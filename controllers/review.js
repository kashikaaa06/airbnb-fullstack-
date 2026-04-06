const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
module.exports.post = async (req,res,next) => {
      let { id } = req.params;
  console.log("=== REVIEW POST DEBUG ===");
  console.log("Listing ID from params:", id);
  
  let listing = await Listing.findById(id);
  console.log("Listing found:", listing ? "Yes" : "No");
  
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
};
 module.exports.delete = async (req,res,next) => {
  let newreview = new Review(req.body.review);
  newreview.author = req.user._id;

  listing.reviews.push(newreview);
  await newreview.save();
  await listing.save();
  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};
