const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.rendernew = (req, res) => {
  res.render("listings/new.ejs");
}

module.exports.show = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
        model: "User"
      }
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
}

module.exports.createpost = async (req, res) => {
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  await newlisting.save();
  req.flash("success", "Successfully listing created");
  res.redirect("/listings");
}

module.exports.edit = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
}

module.exports.update = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing }); 
  req.flash("success", "Successfully listing updated");
  res.redirect(`/listings/${id}`);  
}

module.exports.delete = async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Successfully listing deleted");
  console.log(deleteListing);
  res.redirect("/listings");
}