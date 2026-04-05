const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { loggedin } = require("../middleware.js");
const { isOwner } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  console.log(error);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

router.get("/", wrapAsync(listingController.index));

router.get("/new", loggedin, wrapAsync(listingController.rendernew));

router.get("/:id", wrapAsync(listingController.show));

router.post("/", loggedin, validateListing, wrapAsync(listingController.createpost));

router.get("/:id/edit", loggedin, isOwner, wrapAsync(listingController.edit));

router.put("/:id", loggedin, validateListing, wrapAsync(listingController.update));

router.delete("/:id", loggedin, isOwner, wrapAsync(listingController.delete));

module.exports = router;