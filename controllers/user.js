const User = require("../models/user.js");  // FIXED: changed "..models" to "../models"
const Listing = require("../models/listing.js");  // FIXED: changed "..models" to "../models"

module.exports.register = async (req, res, next) => {
  let { username, email, password } = req.body;
  const user = new User({ username, email });

  try {
    const registeruser = await User.register(user, password);
    console.log(registeruser);
    req.login(registeruser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to travelxgo!");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.loginForm = (req, res) => {
  res.render("user/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to travelxgo");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out successfully");
    res.redirect("/listings");
  });
};

module.exports.signupForm = (req, res) => {
  res.render("user/signup.ejs");
};