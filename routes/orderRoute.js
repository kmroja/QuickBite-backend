import express from "express";
import {
  createOrder,
  getOrders,
  getAllOrders,
  confirmPayment,
  getOrderById,
  updateOrder,
  updateAnyOrder,
  getOrdersByRestaurant,
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

// Admin only
orderRouter.get("/getall", authMiddleware(["admin"]), getAllOrders);
orderRouter.put("/getall/:id", authMiddleware(["admin"]), updateAnyOrder);

// Protected
orderRouter.use(authMiddleware);

// ⭐ RESTAURANT ORDERS (IMPORTANT: BEFORE :id)
orderRouter.get(
  "/restaurant/:restaurantId",
  authMiddleware(["restaurant", "admin"]),
  getOrdersByRestaurant
);

orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders);
orderRouter.get("/confirm", confirmPayment);
orderRouter.get("/:id", getOrderById);
orderRouter.put("/:id", updateOrder);

export default orderRouter;
