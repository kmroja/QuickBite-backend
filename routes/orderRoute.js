import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createOrder,
  getOrders,
  getAllOrders,
  confirmPayment,
  getOrderById,
  updateOrder,
  updateAnyOrder,
  getOrdersByRestaurant
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// ================= ADMIN =================
orderRouter.get("/getall", getAllOrders);
orderRouter.put("/getall/:id", updateAnyOrder);

// ================= AUTH =================
orderRouter.use(authMiddleware);

// ================= RESTAURANT =================
orderRouter.get(
  "/restaurant/:restaurantId",
  authMiddleware(["restaurant", "admin"]),
  getOrdersByRestaurant
);

// ================= USER =================
orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders);
orderRouter.get("/confirm", confirmPayment);
orderRouter.get("/:id", getOrderById);
orderRouter.put("/:id", updateOrder);

export default orderRouter;
