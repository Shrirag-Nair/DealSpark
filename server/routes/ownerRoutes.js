import express from "express";
import { auth, requireOwner } from "../middleware/auth.js";
import Product from "../models/Product.js";

const router = express.Router();

router.post("/products", auth, requireOwner, async (req, res) => {
  const data = { ...req.body, ownerId: req.user._id };
  const product = await Product.create(data);
  res.json(product);
});

router.get("/products", auth, requireOwner, async (req, res) => {
  const products = await Product.find({ ownerId: req.user._id });
  res.json(products);
});

export default router;
