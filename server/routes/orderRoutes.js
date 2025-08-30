import express from "express";
import { createOrder, getMyOrders, getOrderById,deleteOrder } from "../controllers/ordercontroller.js";
import { auth } from "../middleware/auth.js"; 

const router = express.Router();

router.post("/", auth, createOrder); 
router.get("/", auth, getMyOrders); 
router.get("/:id", auth, getOrderById); 
router.delete("/:id", auth, deleteOrder);

export default router;
