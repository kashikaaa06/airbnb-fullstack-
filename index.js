if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
 
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
 

const mongo_url = process.env.ATLAS_DB_URL;
 
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingrouter = require("./routes/listing.js");
const reviewrouter = require("./routes/review.js");
const userrouter = require("./routes/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");
 

if (!mongo_url) {
    console.error("error");
    process.exit(1);
}
 

main()
    .then(() => {
        console.log("✓ Connected to MongoDB Atlas");
    })
    .catch((err) => {
        console.error("✗ MongoDB Connection Error:", err.message);
        process.exit(1);
    });
 
async function main() {
    await mongoose.connect(mongo_url);
}

const store = MongoStore.create({
    mongoUrl: mongo_url,
    touchAfter: 24 * 3600 
});
 
store.on("error", (err) => {
    console.error("❌ SESSION STORE ERROR:", err.message);
});
 
const sessionOptions = {
    store,
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax'
    }
};


app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(cookieParser());
app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
app.locals.getCategoryIcon = (category) => {
    const icons = {
        trending: 'fas fa-chart-line',
        rooms: 'fas fa-bed',
        cities: 'fas fa-city',
        mountains: 'fas fa-mountain',
        castles: 'fas fa-landmark',
        pools: 'fas fa-swimming-pool',
        camping: 'fas fa-campground',
        farms: 'fas fa-tractor',
        arctic: 'fas fa-snowflake'
    };
    return icons[category] || 'fas fa-home';
};

app.use("/listings", listingrouter);
app.use("/listings/:id/reviews", reviewrouter);
app.use("/", userrouter);

app.get("/", (req, res) => {
    res.send("hi , I am groot");
});

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`✓ Server is listening on port ${PORT}`);
});
