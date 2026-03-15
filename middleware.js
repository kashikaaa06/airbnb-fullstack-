module.exports.loggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You need to be logged in to create a listing");
    return res.redirect("/login");
  }
  next();
};