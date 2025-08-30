import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/deals", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(3);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch deals" });
  }
});

router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
    }).limit(6);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.get("/random", async (req, res) => {
  try {
    const products = await Product.aggregate([{ $sample: { size: 6 } }]);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch random products" });
  }
});

router.get("/search", async (req, res) => {
  const keyword = req.query.q;
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Search Failed" });
  }
});

router.get("/shop", async (req, res) => {
  try {
    const category = req.query.category;
    const filter = category ? { category } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.log("Shop route error:", err);
    res.status(500).json({ message: "Failed to fetch Products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product Not Found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

router.post("/:id/offer", async (req, res) => {
  const { id } = req.params;
  const { offer } = req.body;

  console.log(`Offer for product ${id}: ₹${offer}`);

  res.json({ message: "Offer received" });
});

router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      imageUrl,
      originalPrice,
      dealPrice,
      category,
      stock,
      brand,
    } = req.body;

    if (
      !name ||
      !description ||
      !imageUrl ||
      !originalPrice ||
      !dealPrice ||
      !category
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }
    const { images = [], ...rest } = req.body;

    const newProduct = new Product({
      ...rest,
      imageUrl: images.length > 0 ? images[0] : "", // use first image or empty string
      images: images,
      sizes: rest.enableSizes ? rest.sizes : [],
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

router.get("/owner/:ownerId", async (req, res) => {
  try {
    const products = await Product.find({ ownerId: req.params.ownerId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch Owner Products" });
  }
});

export default router;
