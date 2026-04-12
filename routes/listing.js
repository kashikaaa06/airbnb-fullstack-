const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { loggedin, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

router.get("/new", loggedin, wrapAsync(listingController.rendernew));

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(loggedin, validateListing, wrapAsync(listingController.createpost));

router
  .route("/:id")
  .get(wrapAsync(listingController.show))
  .put(loggedin, isOwner, validateListing, wrapAsync(listingController.update))
  .delete(loggedin, isOwner, wrapAsync(listingController.delete));

router.get("/:id/edit", loggedin, isOwner, wrapAsync(listingController.edit));

module.exports = router;