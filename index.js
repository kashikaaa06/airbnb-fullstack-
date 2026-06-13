if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
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
    console.error("❌ ERROR: ATLAS_DB_URL environment variable is not set");
    process.exit(1);
}

// ========== MONGODB CONNECTION ==========
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
// =======================================

// ========== SESSION STORE CONFIGURATION ==========
const store = new MongoDBStore({
    uri: mongo_url,
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 * 7,  // 7 days
    connectionOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
});

store.on('error', function(error) {
    console.error("❌ SESSION STORE ERROR:", error.message);
});

store.on('connected', function() {
    console.log("✓ Session store connected to MongoDB");
});

const sessionOptions = {
    store: store,
    secret: process.env.SESSION_SECRET || "mysecretstring",
    resave: false,
    saveUninitialized: false,  // Changed to false - only save when modified
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 days in milliseconds
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",  // HTTPS only in production
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
        domain: process.env.NODE_ENV === "production" ? undefined : undefined
    },
    name: 'travelxgo_sessionId'  // Custom session name
};

console.log("📋 Session Config:", {
    secure: sessionOptions.cookie.secure,
    httpOnly: sessionOptions.cookie.httpOnly,
    sameSite: sessionOptions.cookie.sameSite,
    maxAge: sessionOptions.cookie.maxAge
});
// ================================================

// ========== EXPRESS SETUP ==========
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(cookieParser());

// ========== SESSION MIDDLEWARE ==========
app.use(session(sessionOptions));
// ========================================

app.use(flash());

// ========== PASSPORT AUTHENTICATION ==========
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// =============================================

// ========== MIDDLEWARE - Flash & User ==========
app.use((req, res, next) => {
    // Log session info in development
    if (process.env.NODE_ENV !== "production") {
        console.log("📍 Session ID:", req.sessionID);
        console.log("👤 User:", req.user ? req.user.username : "Not logged in");
    }
    
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
// =============================================

// ========== HELPER FUNCTION FOR CATEGORY ICONS ==========
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
// ========================================================

// ========== ROUTES ==========
app.use("/listings", listingrouter);
app.use("/listings/:id/reviews", reviewrouter);
app.use("/", userrouter);
// ===========================

// ========== HOME ROUTE ==========
app.get("/", (req, res) => {
    res.redirect("/listings");
});
// ================================

// ========== 404 ERROR HANDLER ==========
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});
// =======================================

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});
// ==================================

// ========== START SERVER ==========
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`✓ Server is listening on port ${PORT}`);
});
// =================================