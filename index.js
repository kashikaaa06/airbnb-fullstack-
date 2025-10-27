const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongo_url = "mongodb://127.0.0.1:27017/travelxgo";
const Listing = require("./models/listing.js");
const path = require("path");

main()
.then(() => {
 console.log("connected to db");
})
.catch((err)=> {
    console.log(err);
});
async function main() {
    await mongoose.connect(mongo_url);
    
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
//app.get("/testlisting", async (req, res) => {
  // try {
    //  let samplelisting = new Listing({
      //   title: "view from my place",
        // description: "mountains",
       //  price: 2000,
      //   location: "kashmir",
        // country: "India",
     // });
      
   //   await samplelisting.save();
   //   console.log("sample was saved:", samplelisting);
   //   res.send("successful testing");
  // } catch (error) {
   //   console.log("Error saving:", error);
   //   res.send("Error occurred");
  // }
//});

//index route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings});

});
//new route 
app.get("/listings/new",async(req,res) => {
 let {id} = req.params;
 const listing = await Listing.findById(id)
  res.render("listings/new.ejs",{listing});
});


//show route 
app.get("/listings/:id",async (req,res) => {
 let {id} = req.params ;
 const listing = await Listing.findById(id);
 res.render("listings/show.ejs", {listing});

});
//create route 
app.post("/listings",async (req,res) => {
  const newlisting = new Listing(req.body.listing);
  await newlisting.save();
  res.redirect("/listings");

})
app.get("/",(req,res) => {
    res.send("hi , I am groot");
});

app.listen(8080,()=> {
    console.log("server is listening to port 8080");
});

