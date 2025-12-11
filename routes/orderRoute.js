import express from 'express';
import {
    createOrder,
    getOrders,
    getAllOrders,
    confirmPayment,
    getOrderById,
    updateOrder,
    updateAnyOrder
} from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js';
import Restaurant from "../modals/restaurantModel.js";
import Order from "../modals/order.js";

const orderRouter = express.Router();

// Public admin endpoints
orderRouter.get('/getall', getAllOrders);
orderRouter.put('/getall/:id', updateAnyOrder);

// Protected Routes
orderRouter.use(authMiddleware);

// ------- ADD THIS BLOCK -------
// ⭐ GET ORDERS FOR A RESTAURANT
orderRouter.get(
  "/restaurant/:restaurantId",
  authMiddleware(["restaurant", "admin"]),
  async (req, res) => {
    try {
      const restaurantId = req.params.restaurantId;

      const orders = await Order.find({
        "items.item.restaurantId": restaurantId,
      }).sort({ createdAt: -1 });

      res.json({ orders });
    } catch (err) {
      console.error("Error fetching restaurant orders:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);


// -------------------------------

orderRouter.post('/', createOrder);
orderRouter.get('/', getOrders);
orderRouter.get('/confirm', confirmPayment);
orderRouter.get('/:id', getOrderById);
orderRouter.put('/:id', updateOrder);

export default orderRouter;
