import express from"express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
const router=express.Router();


router.post("/register",async(req,res)=>{
    try{
        const {name,email,password,role}=req.body;
        if(!name||!email||!password) return res.status(400).json({message:"Missing fields"});
        const existing=await User.findOne({email});
        if(existing) return res.status(400).json({message:"Email Already Exists"});
        const salt=await bcrypt.genSalt(10);
        const hash=await bcrypt.hash(password,salt);
        const user=await User.create({name,email,passwordHash:hash,role:role=== "owner" ? "owner" : "buyer"});
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;