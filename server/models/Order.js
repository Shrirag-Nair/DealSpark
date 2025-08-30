import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
      phone: String,
    },
    deliveryDate: { type: Date, required: true },
    status: { type: String, enum: ["processing", "shipped", "delivered"], default: "processing" },
    paymentIntentId: { type: String, required: true }, // Stripe PaymentIntent ID
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
