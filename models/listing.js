const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    filename: {
      type: String,
      default: "listingimage"
    },
    url: {
      type: String,
      default: "https://media-cdn.tripadvisor.com/media/photo-s/18/4b/c3/b8/and-into-the-forest-i.jpg",
      set: (v) => v === "" ? "https://media-cdn.tripadvisor.com/media/photo-s/18/4b/c3/b8/and-into-the-forest-i.jpg" : v
    }
  },
  price: Number,
  location: String,
  country: String,
  reviews : [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;