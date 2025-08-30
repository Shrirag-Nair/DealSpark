import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Made required
  name: String,
  description: String,
  imageUrl: String,
  originalPrice: Number,
  dealPrice: Number,
  category: String,
  stock: {
    type: Number,
    default: 10,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    default: 4.2,
  },
  numReviews: {
    type: Number,
    default: 10,
  },
  offers: {
    type: [String],
    default: [],
  },
  sizes: {
    type: [Number],
    default: [6, 7, 8, 9, 10],
  },
  brand: String,
  images: {
    type: [String],
    default: [],
  },
  seller: {
    name: String,
    rating: Number,
  },
  reviews: [
    {
      user: String,
      rating: Number,
      comment: String,
      date: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Product", productSchema);