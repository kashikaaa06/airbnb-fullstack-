const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/travelxgo";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  console.log("Sample data:", initData.data[0]); // Check first listing
  initData.data = initData.data.map((obj) => ({...obj, owner: "654a7b8c9d0e1f2a3b4c5d6e"}));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
}

initDB();