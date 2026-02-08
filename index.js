const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongo_url = "mongodb://127.0.0.1:27017/travelxgo";
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const Review = require("./models/review.js");
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongo_url);
}

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const validateListing = (req,res,next) => {
   let {error} = listingSchema.validate(req.body);
  console.log(error);
  if (error) {
    let errmsg = error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400,errmsg);
  }
}

// Routes
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

app.get("/listings/new", wrapAsync(async (req, res) => {
  res.render("listings/new.ejs");
}));

app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

app.post("/listings",validateListing, wrapAsync(async (req, res) => {
 
  const newlisting = new Listing(req.body.listing);
  await newlisting.save();
  res.redirect("/listings");
}));

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect("/listings");
}));
//delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  res.redirect("/listings");
}));
// reviews route
app.post("/listings/:id/review", async(req,res)=> {
  let listing = await Listing.findById(req.params.id);
  let newreview = new Review(req.body.review);
  listing.reviews.push(newreview);
  await newreview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
});
app.get("/", (req, res) => {
  res.send("hi , I am groot");
});


app.use( (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Error handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("listings/error.ejs",{message});

});

app.listen(8000, () => {
  console.log("server is listening to port 8000");
});