const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.rendernew = (req, res) => {
  res.render("listings/new.ejs");
};

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
};

module.exports.createpost = async (req, res) => {
  console.log("FILE RECEIVED:", req.file);
  console.log("FORM DATA:", req.body);
  
  if (!req.file) {
    req.flash("error", "Please upload an image");
    return res.redirect("/listings/new");
  }
  let url = req.file.path;
  let filename = req.file.filename;
  
  const newlisting = new Listing({
    title: req.body.listing.title,
    description: req.body.listing.description,
    price: req.body.listing.price,
    location: req.body.listing.location,
    country: req.body.listing.country,
    image: {
      url: url,
      filename: filename
    },
    owner: req.user._id
  });
  
  await newlisting.save();
  req.flash("success", "Successfully listing created");
  res.redirect("/listings");
};

module.exports.edit = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
  let originalimage = listing.image.url; 
  originalimage = originalimage.replace("/uploads/", "/uploads/h_200,w_150"); 
  res.render("listings/edit.ejs", { listing, originalimage });
};

module.exports.update = async (req, res) => {
  const { id } = req.params;
 let listing =  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
 if (  req.file)  { 
 let url = req.file.path;
  let filename = req.file.filename;
  listing.image = {url: url, filename: filename}; 
  await listing.save();
 }
  req.flash("success", "Successfully listing updated");
  res.redirect(`/listings/${id}`);
};

module.exports.delete = async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Successfully listing deleted");
  console.log(deleteListing);
  res.redirect("/listings");
};