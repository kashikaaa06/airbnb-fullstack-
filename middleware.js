
const Listing = require("./models/listing");
module.exports.loggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; 
        req.flash("error", "You need to be logged in to create a listing");
        return res.redirect("/login");
    }
    next();
};

module.exports.savedRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }  
    next();
};
module.exports.isOwner = async(req,res,next) => {
  let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)){
      req.flash("error", "You don't have permission to do that");
      return res.redirect(`/listings/${id}`);
    }
    next();
}