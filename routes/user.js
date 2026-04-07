const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

router.get("/signup", userController.signupForm);
router.post("/signup", wrapAsync(userController.register));

router.get("/login", userController.loginForm);
router.post("/login", savedRedirectUrl, passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: true
}), userController.login);

router.get("/logout", userController.logout);

module.exports = router;