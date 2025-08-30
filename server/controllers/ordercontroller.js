import Order from "../models/Order.js";
import User from "../models/User.js";


export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentIntentId,deliveryDate } = req.body;
    const userId = req.user.id; 
    

    const newOrder = new Order({
      user: userId,
      items,
      totalAmount,
      shippingAddress,
      paymentIntentId,
      deliveryDate,
    });

    await newOrder.save();

   
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).populate("items.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this order" });
    }

    await order.deleteOne();
    res.json({ message: "Order removed successfully" });
  } catch (err) {
    console.error("Delete order failed:", err);
    res.status(500).json({ message: "Failed to delete order" });
  }
};
