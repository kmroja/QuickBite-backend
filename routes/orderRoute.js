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

const orderRouter = express.Router();

// ================= ADMIN =================
orderRouter.get(
  "/getall",
  authMiddleware(["admin"]),
  getAllOrders
);

orderRouter.put(
  "/getall/:id",
  authMiddleware(["admin"]),
  updateAnyOrder
);

// ================= USER CHECKOUT =================
orderRouter.post(
  "/",
  authMiddleware(["user"]), // ✅ FIXED
  createOrder
);

// ================= USER ORDERS =================
orderRouter.get(
  "/",
  authMiddleware(["user", "restaurant", "admin"]),
  getOrders
);

orderRouter.get(
  "/confirm",
  authMiddleware(["user"]),
  confirmPayment
);

orderRouter.get(
  "/:id",
  authMiddleware(["user", "restaurant", "admin"]),
  getOrderById
);

orderRouter.put(
  "/:id",
  authMiddleware(["user"]),
  updateOrder
);

export default orderRouter;
