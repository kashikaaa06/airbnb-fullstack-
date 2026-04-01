const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");

router.get("/signup", async (req, res) => {
  res.render("user/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res, next) => {
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
}));

router.get("/login", async (req, res) => {
  res.render("user/login.ejs");
});

router.post("/login",
  savedRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
  async (req, res) => {
    req.flash("success", "Welcome back to travelxgo");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);

router.get("/logout", async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out successfully");
    res.redirect("/listings");
  });
});

module.exports = router;