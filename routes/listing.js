
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { loggedin, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage: storage });
 
// Check if image file exists
const checkImage = (req, res, next) => {
  if (!req.file) {
    req.flash("error", "Please upload an image");
    return res.redirect("/listings/new");
  }
  next();
};
 
// Validate listing data using Joi schema
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    req.flash("error", errmsg);
    return res.redirect("/listings/new");
  } else {
    next();
  }
};
 
router.get("/new", loggedin, wrapAsync(listingController.rendernew));
 
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    loggedin, 
    upload.single("image"), 
    checkImage,           // Check image first
    validateListing,      // Then validate other fields
    wrapAsync(listingController.createpost)
  );
 
router  
  .route("/:id")
  .get(wrapAsync(listingController.show))
  .put(loggedin, isOwner, wrapAsync(listingController.update))
  .delete(loggedin, isOwner, wrapAsync(listingController.delete));
 
router.get("/:id/edit", loggedin, isOwner, wrapAsync(listingController.edit));
 
module.exports = router;