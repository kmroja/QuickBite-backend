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
  updateOrderStatus, // ✅ ADD THIS
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

/* ================= ADMIN ================= */
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

/* ================= RESTAURANT ================= */
orderRouter.get(
  "/restaurant",
  authMiddleware(["restaurant", "admin"]),
  getOrdersByRestaurant
);

// ✅ NEW: RESTAURANT UPDATE ORDER STATUS
orderRouter.put(
  "/:id/status",
  authMiddleware(["restaurant", "admin"]),
  updateOrderStatus
);

/* ================= USER CHECKOUT ================= */
orderRouter.post(
  "/",
  authMiddleware(["user"]),
  createOrder
);

/* ================= USER / COMMON ================= */
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

// ❗ user can update ONLY own order (address etc.)
orderRouter.put(
  "/:id",
  authMiddleware(["user"]),
  updateOrder
);

export default orderRouter;
