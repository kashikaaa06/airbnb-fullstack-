const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongo_url = "mongodb://127.0.0.1:27017/travelxgo";
const Listing = require("./models/listing.js");
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
app.get("/testlisting", async (req, res) => {
   try {
      let samplelisting = new Listing({
         title: "view from my place",
         description: "mountains",
         price: 2000,
         location: "kashmir",
         country: "India",
      });
      
      await samplelisting.save();
      console.log("sample was saved:", samplelisting);
      res.send("successful testing");
   } catch (error) {
      console.log("Error saving:", error);
      res.send("Error occurred");
   }
});
app.get("/",(req,res) => {
    res.send("hi , I am groot");
});
app.listen(8080,()=> {
    console.log("server is listening to port 8080");
});

