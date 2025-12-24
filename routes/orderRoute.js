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

// ADMIN
orderRouter.get("/getall", authMiddleware(), getAllOrders);
orderRouter.put("/getall/:id", authMiddleware(), updateAnyOrder);

// USER / RESTAURANT
orderRouter.use(authMiddleware());

orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders);
orderRouter.get("/confirm", confirmPayment);
orderRouter.get("/:id", getOrderById);
orderRouter.put("/:id", updateOrder);

export default orderRouter;
