import Stripe from 'stripe';
import Order from '../modals/order.js';
import Restaurant from '../modals/restaurantModel.js';
import 'dotenv/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Order

export const createOrder = async (req, res) => {
  try {
    console.log("USER 👉", req.user);
    console.log("BODY 👉", req.body);

    const { name, description, price, category } = req.body;

    // 🔒 STRICT VALIDATION (schema-aligned)
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        message: "name, description, price and category are required",
      });
    }

    let restaurantId;

    // ✅ RESTAURANT OWNER FLOW
    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });

      if (!restaurant) {
        return res.status(400).json({
          message: "No restaurant linked to this account",
        });
      }

      restaurantId = restaurant._id;
    }

    // ✅ ADMIN FLOW
    if (req.user.role === "admin") {
      if (!req.body.restaurantId) {
        return res.status(400).json({
          message: "restaurantId is required for admin",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(req.body.restaurantId)) {
        return res.status(400).json({
          message: "Invalid restaurantId",
        });
      }

      restaurantId = req.body.restaurantId;
    }

    const newItem = await Item.create({
      name,
      description,
      category, // ✅ REQUIRED
      price,
      restaurant: restaurantId,
      imageUrl: req.file?.filename || "",
    });

    await Restaurant.findByIdAndUpdate(restaurantId, {
      $push: { menu: newItem._id },
    });

    res.status(201).json({
      success: true,
      item: newItem,
    });
  } catch (err) {
    console.error("Create item error:", err);
    res.status(500).json({
      message: "Failed to create item",
      error: err.message,
    });
  }
};


// Confirm Payment
export const confirmPayment = async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ message: 'session_id required' });

        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
            const order = await Order.findOne({ sessionId: session_id });
            if (!order) return res.status(404).json({ message: 'Order not found' });

            order.paymentStatus = 'succeeded';
            await order.save();

            return res.json(order);
        }
        return res.status(400).json({ message: 'Payment not completed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get Orders for current user (User or Restaurant)
export const getOrders = async (req, res) => {
    try {
        let orders;

        if (req.user.role === 'restaurant') {
            // Fetch restaurant owned by user
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            if (!restaurant) return res.json([]);

            // Only orders that include items from this restaurant
            orders = await Order.find({
                "items.item._id": { $in: restaurant.menu }
            }).sort({ createdAt: -1 }).lean();
        } else if (req.user.role === 'user') {
            orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
        } else {
            // Admin
            orders = await Order.find().sort({ createdAt: -1 }).lean();
        }

        res.json(orders);
    } catch (error) {
        console.error('getOrders error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get All Orders (Admin only)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).lean();
        res.json(orders);
    } catch (error) {
        console.error('getAllOrders error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update Any Order (Admin)
export const updateAnyOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const { status, paymentStatus, expectedDelivery, deliveredAt } = req.body;

        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        if (expectedDelivery) order.expectedDelivery = expectedDelivery;
        if (deliveredAt) order.deliveredAt = deliveredAt;

        await order.save();
        res.json(order);
    } catch (error) {
        console.error('updateAnyOrder error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get Order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.user.role === 'user' && !order.user.equals(req.user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (req.user.role === 'restaurant') {
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            const restaurantItemIds = restaurant?.menu.map(id => id.toString()) || [];
            const orderItemIds = order.items.map(i => i.item._id.toString());
            if (!orderItemIds.some(id => restaurantItemIds.includes(id))) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        res.json(order);
    } catch (error) {
        console.error('getOrderById error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update Order (User)
export const updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (!order.user.equals(req.user._id)) return res.status(403).json({ message: 'Access denied' });

        const { status, paymentStatus, expectedDelivery, deliveredAt, ...allowedFields } = req.body;
        Object.assign(order, allowedFields);

        await order.save();
        res.json(order);
    } catch (error) {
        console.error('updateOrder error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
// NEW — Get orders for a specific restaurant
// Get orders for a specific restaurant
export const getOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const orders = await Order.find({
      "items.item.restaurantId": restaurantId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("getOrdersByRestaurant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant orders",
    });
  }
};
