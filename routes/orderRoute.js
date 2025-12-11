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
orderRouter.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        const orders = await Order.find({
            "items.item._id": { $in: restaurant.menu }
        }).sort({ createdAt: -1 });

        res.json({ orders });
    } catch (error) {
        console.error("Restaurant Orders Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// -------------------------------

orderRouter.post('/', createOrder);
orderRouter.get('/', getOrders);
orderRouter.get('/confirm', confirmPayment);
orderRouter.get('/:id', getOrderById);
orderRouter.put('/:id', updateOrder);

export default orderRouter;
