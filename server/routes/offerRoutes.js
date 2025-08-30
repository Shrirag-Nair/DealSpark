import express from "express";
import Offer from "../models/Offer.js";
import Product from "../models/Product.js";
import { auth } from "../middleware/auth.js";
import { sendEmail } from "../utils/mailer.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();


router.post("/", auth, async (req, res) => {
  try {
    const { productId, offeredPrice } = req.body;
    
    
    const product = await Product.findById(productId).select("ownerId name imageUrl dealPrice");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

  
    if (!product.ownerId) {
      return res.status(400).json({ message: "Product not have an owner assigned" });
    }

    
    const existingOffer = await Offer.findOne({
      productId,
      buyerId: req.user._id,
      status: { $in: ["pending", "countered_by_owner", "countered_by_buyer"] },
    });
    if (existingOffer) {
      return res.status(400).json({ message: "You already have an active offer for this product" });
    }

    
    const minOffer = product.dealPrice * 0.95;
    if (offeredPrice < minOffer) {
      return res.status(400).json({ message: `Offer must be at least ₹${Math.floor(minOffer)}` });
    }

    const offer = new Offer({
      productId,
      buyerId: req.user._id,
      ownerId: product.ownerId,
      offeredPrice,
      status: "pending",
      history: [{ by: "buyer", price: offeredPrice, note: "Initial offer" }],
      seenBy: [req.user._id], 
    });
    await offer.save();
    const populatedOffer = await offer.populate("productId", "name imageUrl dealPrice ownerId");
    

    const populatedOfferWithOwner = await Offer.findById(offer._id).populate({
      path: "productId",
      populate: { path: "ownerId", select: "email" },
    });
    if (populatedOfferWithOwner.productId.ownerId?.email) {
      await sendEmail(
        populatedOfferWithOwner.productId.ownerId.email,
        "New Offer Received",
        `A new offer of ₹${offeredPrice} has been made on your product: ${populatedOffer.productId.name}`
      );
    } else {
      console.warn("Owner email not found for product:", populatedOffer.productId.name);
    }

   
    const populatedOfferWithBuyer = await Offer.findById(offer._id).populate("buyerId", "email");
    if (populatedOfferWithBuyer.buyerId.email) {
      await sendEmail(
        populatedOfferWithBuyer.buyerId.email,
        "Offer Submitted",
        `Your offer of ₹${offeredPrice} for ${populatedOffer.productId.name} has been submitted and is pending approval.`
      );
    }

    res.json(populatedOffer);
  } catch (err) {
    console.error("POST /offers error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/my-offer/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const offer = await Offer.findOne({
      productId,
      buyerId: req.user._id,
    }).populate("productId", "name imageUrl dealPrice");
    res.json(offer);
  } catch (err) {
    console.error("GET /offers/my-offer/:productId error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/buyer", auth, async (req, res) => {
  try {
    const offers = await Offer.find({ buyerId: req.user._id })
      .populate("productId", "name imageUrl dealPrice")
      .populate("buyerId", "name email");
    res.json(offers);
  } catch (err) {
    console.error("GET /offers/buyer error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/owner", auth, async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("productId", "name imageUrl dealPrice ownerId")
      .populate("buyerId", "name email");
    const myOffers = offers.filter(
      (o) => o.productId.ownerId?.toString() === req.user._id.toString()
    );
    res.json(myOffers);
  } catch (err) {
    console.error("GET /offers/owner error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/buyer/count", auth, async (req, res) => {
  try {
    const count = await Offer.countDocuments({
      buyerId: req.user._id,
      status: { $in: ["pending", "countered_by_owner", "countered_by_buyer", "accepted"] },
    });
    res.json({ count });
  } catch (err) {
    console.error("GET /offers/buyer/count error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/owner/count", auth, async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("productId", "ownerId")
      .lean();
    const count = offers.filter(
      (o) =>
        o.productId.ownerId?.toString() === req.user._id.toString() &&
        ["pending", "countered_by_buyer"].includes(o.status)
    ).length;
    res.json({ count });
  } catch (err) {
    console.error("GET /offers/owner/count error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.patch("/:id", auth, async (req, res) => {
  try {
    const { status, counterPrice } = req.body;
    const offer = await Offer.findById(req.params.id).populate("productId", "name ownerId buyerId");

    if (!offer) return res.status(404).json({ message: "Offer not found" });

    const isOwner = offer.productId.ownerId?.toString() === req.user._id.toString();
    const isBuyer = offer.buyerId.toString() === req.user._id.toString();

    if (!isOwner && !isBuyer) {
      return res.status(403).json({ message: "Not authorized" });
    }

    
    console.log("Offer schema status enum:", Offer.schema.path("status").enumValues);

    if (status === "accepted") {
      if (status === "accepted" && isOwner && !["pending", "countered_by_buyer"].includes(offer.status)) {
        return res.status(403).json({ message: "Owner can only accept pending or buyer-countered offers" });
      }
      if (status === "accepted" && isBuyer && offer.status !== "countered_by_owner") {
        return res.status(403).json({ message: "Buyer can only accept owner-countered offers" });
      }
      offer.status = status;
      offer.counterPrice = offer.counterPrice || offer.offeredPrice;
      offer.history.push({
        by: isOwner ? "owner" : "buyer",
        price: offer.counterPrice,
        note: "Offer accepted",
      });
     
      offer.seenBy = isOwner ? [offer.ownerId] : [offer.buyerId];
      
      const recipient = isOwner
        ? (await Offer.findById(offer._id).populate("buyerId", "email")).buyerId.email
        : (
            await Offer.findById(offer._id).populate({
              path: "productId",
              populate: { path: "ownerId", select: "email" },
            })
          ).productId.ownerId?.email;
      if (recipient) {
        await sendEmail(
          recipient,
          "Offer Accepted",
          `The offer for ${offer.productId.name} has been accepted at ₹${offer.counterPrice || offer.offeredPrice}.`
        );
      }
    } else if (status === "rejected") {
      
      if (isOwner && !["pending", "countered_by_buyer"].includes(offer.status)) {
        return res.status(403).json({ message: "Owner can only reject pending or buyer-countered offers" });
      }
      if (isBuyer && offer.status !== "countered_by_owner") {
        return res.status(403).json({ message: "Buyer can only reject owner-countered offers" });
      }
      offer.status = status;
      offer.counterPrice = undefined;
      offer.history.push({
        by: isOwner ? "owner" : "buyer",
        note: "Offer rejected",
      });
      
      offer.seenBy = isOwner ? [offer.ownerId] : [offer.buyerId];
   
      const recipient = isOwner
        ? (await Offer.findById(offer._id).populate("buyerId", "email")).buyerId.email
        : (
            await Offer.findById(offer._id).populate({
              path: "productId",
              populate: { path: "ownerId", select: "email" },
            })
          ).productId.ownerId?.email;
      if (recipient) {
        await sendEmail(
          recipient,
          "Offer Rejected",
          `The offer for ${offer.productId.name} has been rejected.`
        );
      }
    } else if (status === "countered") {
      if (!counterPrice) return res.status(400).json({ message: "counterPrice required" });
      offer.status = isOwner ? "countered_by_owner" : "countered_by_buyer";
      offer.counterPrice = Number(counterPrice);
      offer.history.push({
        by: isOwner ? "owner" : "buyer",
        price: counterPrice,
        note: isOwner ? "Countered by owner" : "Countered by buyer",
      });
     
      offer.seenBy = isOwner ? [offer.ownerId] : [offer.buyerId];
    
      const recipient = isOwner
        ? (await Offer.findById(offer._id).populate("buyerId", "email")).buyerId.email
        : (
            await Offer.findById(offer._id).populate({
              path: "productId",
              populate: { path: "ownerId", select: "email" },
            })
          ).productId.ownerId?.email;
      if (recipient) {
        await sendEmail(
          recipient,
          "New Counter Offer",
          `A counter offer of ₹${counterPrice} has been made on ${offer.productId.name}.`
        );
      }
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }

    await offer.save();
    res.json(
      await Offer.findById(offer._id)
        .populate("productId", "name imageUrl dealPrice")
        .populate("buyerId", "name email")
    );
  } catch (err) {
    console.error("PATCH /offers/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/:id", auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("productId");
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    if (
      offer.buyerId.toString() !== req.user._id.toString() &&
      offer.productId.ownerId?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await offer.deleteOne();
    res.json({ message: "Offer removed" });
  } catch (err) {
    console.error("DELETE /offers/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/owner/mark-seen", auth, async (req, res) => {
  try {
    const ownerId = req.user._id;

    await Offer.updateMany(
      { ownerId, seenByOwner: false },
      { $set: { seenByOwner: true } }
    );

    res.json({ success: true, message: "Owner offers marked as seen" });
  } catch (err) {
    console.error("POST /offers/owner/mark-seen error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



router.post("/create-payment-intent", auth, async (req, res) => {
  try {
    const { amount } = req.body; 
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: "inr",
      payment_method_types: ["card"],
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Create payment intent error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/buyer/mark-seen", auth, async (req, res) => {
  try {
    const buyerId = req.user._id;

    await Offer.updateMany(
      { buyerId, seenByBuyer: false },
      { $set: { seenByBuyer: true } }
    );

    res.json({ success: true, message: "Buyer offers marked as seen" });
  } catch (err) {
    console.error("POST /offers/buyer/mark-seen error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;