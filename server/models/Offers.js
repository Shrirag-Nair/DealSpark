import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  offeredPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "countered_by_owner", "countered_by_buyer"],
    default: "pending",
  },
  counterPrice: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Offer", offerSchema);