import express from "express"
import {auth} from "../middleware/auth.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

const router=express.Router();

router.get("/me",auth,async(req,res)=>{
    const user=await User.findById(req.user._id).select("-passwordHash");
    res.json(user);
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("cart.ProductId") 
      .select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id",async(req,res)=>{
  try{
    const updates=req.body;
    const user=await User.findByIdAndUpdate(req.params.id,updates,{new:true}).select("-passwordHash");
    if(!user) return res.status(400).json({messsage:"User Not Found"});
    res.json(user);
  } catch(err){
    console.log("PATCH /users/:id error",err);
    res.status(500).json({message:"Server Error"});
  }
});


router.post("/:id/addresses",async(req,res)=>{
  try{
    const {street,city,state,phone,pincode,country,isDefault}=req.body;
    const user=await User.findById(req.params.id);
    if(!user) return res.status(404).json({message:"User not found"});

    const address={
      _id: new mongoose.Types.ObjectId(),
      street,
      city,
      state,
      phone,
      pincode,
      country:country|| "India",
      isDefault: !!isDefault,
    };
    if(address.isDefault){
      user.addresses.forEach((a)=>(a.isDefault=false));
    }else if(!user.addresses || user.addresses.length===0){
      address.isDefault=true;
    }

    user.addresses.push(address);
    await user.save();
    const result=await User.findById(req.params.id).select("-passwordHash");
    res.status(201).json(result);
  } catch(err){
    console.log("POST /users/:id/addresses error",err);
    res.status(500).json({message:"Server Error"});
  }
});

router.put("/:id/addresses/:addrId", async (req, res) => {
  try {
    const { addrId, id } = req.params;
    const updates = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addr = user.addresses.id(addrId);
    if (!addr) return res.status(404).json({ message: "Address not found" });

    Object.assign(addr, updates);
    await user.save();
    const result = await User.findById(id).select("-passwordHash");
    res.json(result);
  } catch (err) {
    console.error("PUT /users/:id/addresses/:addrId error", err);
    res.status(500).json({ message: "Server error" });
  }
});



router.delete("/:id/addresses/:addrId", async (req, res) => {
  try {
    const { id, addrId } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter(
      (address) => address._id.toString() !== addrId
    );

    if (user.addresses.length === initialLength) {
      return res.status(404).json({ message: "Address not found" });
    }

    
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ message: "Address deleted successfully", addresses: user.addresses });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.patch("/:id/addresses/:addrId/default", async (req, res) => {
  try {
    const { id, addrId } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses.forEach((a) => (a.isDefault = a._id.toString() === addrId));
    await user.save();
    const result = await User.findById(id).select("-passwordHash");
    res.json(result);
  } catch (err) {
    console.error("PATCH set default error", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post('/cart/add', auth, async (req, res) => {
    console.log("req.user in /cart/add:", req.user);

    const { productId, qty = 1 } = req.body;

    if (!productId) {
        return res.status(400).json({ message: "productId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid productId format" });
    }

    try {
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const price = product.dealPrice;

        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        
        const existing = user.cart.find(c => c.ProductId && c.ProductId.toString() === productId);
        if (existing) {
            existing.qty += qty;
        } else {
            user.cart.push({ ProductId: productId, qty, price });
        }

        
        await user.save();
        console.log("Updated user cart:", user.cart);
        await user.populate("cart.ProductId");
        res.json(user.cart);
    } catch (error) {
        console.error("Error in /cart/add:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/cart", auth, async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart.productId");
  res.json(user.cart);
});

router.post("/cart/remove", auth, async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter(c => c.productId.toString() !== productId);
  await user.save();
  res.json(user.cart);
});

router.post("/address", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.push(req.body);
  await user.save();
  res.json(user.addresses);
});

router.put("/address/:idx", auth, async (req, res) => {
  const idx = parseInt(req.params.idx, 10);
  const user = await User.findById(req.user._id);
  if (user.addresses[idx]) user.addresses[idx] = { ...user.addresses[idx].toObject(), ...req.body };
  await user.save();
  res.json(user.addresses);
});

router.delete("/address/:idx", auth, async (req, res) => {
  const idx = parseInt(req.params.idx, 10);
  const user = await User.findById(req.user._id);
  user.addresses.splice(idx, 1);
  await user.save();
  res.json(user.addresses);
});


router.post("/:id/cart", async (req, res) => {
  try {
    const user=await User.findById(req.params.id).populate("cart.ProductId");
    if(!user){
      return res.status(404).json({message:"User not found"});
    }
    res.json(user.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id/cart/:productId",async(req,res)=>{
  try{
    const user=await User.findById(req.params.id);
    if(!user){
      return res.status(404).json({message:"User not found"});
    }
    user.cart=user.cart.filter(
      (item)=>item.ProductId.toString() !==req.params.productId
    );
    await user.save();
    res.json({message:"Item removed",cart:user.cart});
  }catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




export default router;