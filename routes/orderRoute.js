import express from "express";
import {
  createOrder,
  getOrders,
  getAllOrders,
  confirmPayment,
  getOrderById,
  updateOrder,
  updateAnyOrder,
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/auth.js";
import Order from "../modals/order.js";

const orderRouter = express.Router();

// ================= ADMIN PUBLIC =================
orderRouter.get("/getall", getAllOrders);
orderRouter.put("/getall/:id", updateAnyOrder);

// ================= PROTECTED =================
orderRouter.use(authMiddleware());

// ⭐ RESTAURANT ORDERS (ONLY ONE AUTH)
orderRouter.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    // role guard
    if (!["restaurant", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { restaurantId } = req.params;

    const orders = await Order.find({
      "items.item.restaurantId": restaurantId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("Restaurant orders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ================= OTHER ROUTES =================
orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders);
orderRouter.get("/confirm", confirmPayment);
orderRouter.get("/:id", getOrderById);
orderRouter.put("/:id", updateOrder);

export default orderRouter;
