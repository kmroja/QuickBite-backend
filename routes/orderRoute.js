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

orderRouter.put(
  "/:id",
  authMiddleware(["user"]),
  updateOrder
);

export default orderRouter;
