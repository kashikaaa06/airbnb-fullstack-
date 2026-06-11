
const Listing = require("../models/listing.js");
 
module.exports.index = async (req, res) => {
  try {
    const allListings = await Listing.find({}).sort({ createdAt: -1 });
    res.render("listings/index.ejs", { allListings });
  } catch (error) {
    console.error("Error in index:", error);
    req.flash("error", "Error loading listings");
    return res.redirect("/");
  }
};
 
module.exports.rendernew = (req, res) => {
  try {
    res.render("listings/new.ejs");
  } catch (error) {
    console.error("Error in rendernew:", error);
    req.flash("error", "Error loading form");
    return res.redirect("/listings");
  }
};
 
module.exports.show = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error in show:", error);
    req.flash("error", "Error loading listing");
    return res.redirect("/listings");
  }
};
 
module.exports.createpost = async (req, res) => {
  try {
    console.log("=== CREATE LISTING ===");
    console.log("FILE RECEIVED:", req.file);
    console.log("FORM DATA:", req.body);
    
    // Double check - image should already be validated by middleware
    if (!req.file) {
      req.flash("error", "Please upload an image");
      return res.redirect("/listings/new");
    }
    
    let url = req.file.path;
    let filename = req.file.filename;
    
    console.log("IMAGE URL:", url);
    console.log("IMAGE FILENAME:", filename);
    
    const newlisting = new Listing({
      title: req.body.listing.title,
      description: req.body.listing.description,
      price: req.body.listing.price,
      location: req.body.listing.location,
      country: req.body.listing.country,
      category: req.body.listing.category,
      image: {
        url: url,
        filename: filename
      },
      owner: req.user._id
    });
    
    console.log("SAVING LISTING:", newlisting);
    await newlisting.save();
    
    console.log("✓ LISTING CREATED SUCCESSFULLY");
    req.flash("success", "Successfully listing created");
    return res.redirect("/listings");
    
  } catch (error) {
    console.error("ERROR in createpost:", error);
    req.flash("error", "Error creating listing: " + error.message);
    return res.redirect("/listings/new");
  }
};
 
module.exports.edit = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
      req.flash("error", "Listing you requested does not exist");
      return res.redirect("/listings");
    }
    
    res.render("listings/edit.ejs", { listing });
  } catch (error) {
    console.error("Error in edit:", error);
    req.flash("error", "Error loading edit form");
    return res.redirect("/listings");
  }
};
 
module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("=== UPDATE LISTING ===");
    console.log("FILE RECEIVED:", req.file);
    console.log("FORM DATA:", req.body);
    
    // Update listing with all form data (including category)
    let listing = await Listing.findByIdAndUpdate(
      id, 
      { ...req.body.listing },
      { runValidators: true }
    );
    
    // If new image was uploaded, update it
    if (req.file) {
      console.log("Updating image...");
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url: url, filename: filename };
    }
    
    await listing.save();
    
    console.log("✓ LISTING UPDATED SUCCESSFULLY");
    req.flash("success", "Successfully listing updated");
    return res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("ERROR in update:", error);
    req.flash("error", "Error updating listing: " + error.message);
    return res.redirect("/listings");
  }
};
 
module.exports.delete = async (req, res) => {
  try {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully listing deleted");
    console.log(deleteListing);
    return res.redirect("/listings");
  } catch (error) {
    console.error("Error in delete:", error);
    req.flash("error", "Error deleting listing");
    return res.redirect("/listings");
  }
};
 