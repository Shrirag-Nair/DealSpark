import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  offeredPrice: {
    type: Number,
    required: true,
  },
  counterPrice: {
    type: Number,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "rejected",
      "countered_by_owner",
      "countered_by_buyer",
    ],
    default: "pending",
  },
  history: [
    {
      by: { type: String, enum: ["buyer", "owner"], required: true },
      price: { type: Number },
      note: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  seenBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  seenByOwner: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Offer", offerSchema);
