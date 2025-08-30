import express from "express";
import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import OfferRoutes from "./routes/offerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/offers",OfferRoutes);
app.use("/api/products",productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/",(req,res)=>res.send("DealSpark API is running"));

const PORT= process.env.PORT;
console.log("Connecting to:", process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>app.listen(PORT,() => console.log(`Server running on port ${PORT}`)))
.catch((err)=>console.error(err));
