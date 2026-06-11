
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
 
// Middleware 1: Check if image file was uploaded (for create only)
const validateImage = (req, res, next) => {
  if (!req.file) {
    req.flash("error", "Please upload an image");
    return res.redirect("/listings/new");
  }
  next();
};
 
// Middleware 2: Validate form data using Joi schema
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    req.flash("error", errmsg);
    return res.redirect("/listings/new");
  }
  next();
};
 
// GET /listings/new - Show form to create new listing
router.get("/new", loggedin, wrapAsync(listingController.rendernew));
 
// GET /listings - Show all listings
router.get(
  "/",
  wrapAsync(listingController.index)
);
 
// POST /listings - Create new listing
router.post(
  "/",
  loggedin,
  upload.single("image"),
  validateImage,
  validateListing,
  wrapAsync(listingController.createpost)
);
 
// GET /listings/:id - Show single listing
router.get(
  "/:id",
  wrapAsync(listingController.show)
);
 
// GET /listings/:id/edit - Show edit form
router.get(
  "/:id/edit",
  loggedin,
  isOwner,
  wrapAsync(listingController.edit)
);
 
// PUT /listings/:id - Update listing (image is optional)
router.put(
  "/:id",
  loggedin,
  isOwner,
  upload.single("image"),
  validateListing,
  wrapAsync(listingController.update)
);
 
// DELETE /listings/:id - Delete listing
router.delete(
  "/:id",
  loggedin,
  isOwner,
  wrapAsync(listingController.delete)
);
 
module.exports = router;
 