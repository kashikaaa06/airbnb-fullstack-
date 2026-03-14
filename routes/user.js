const express = require("express");
const router = express.Router();
const User = require("../models/user.js"); // ADD THIS LINE
const wrapAsync = require("../utils/wrapAsync.js");

router.get("/signup", async(req,res) => {
    res.render("user/signup.ejs");
})

router.post("/signup",wrapAsync( async(req,res)=> {
    let {username, email, password} = req.body;
    const user = new User({username, email});
    
    try {
        const registeruser = await User.register(user, password);
        console.log(registeruser);
        req.flash("success", "Welcome to travelxgo");
        res.redirect("/listings");
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}))

module.exports = router;
