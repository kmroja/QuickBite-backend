import Stripe from "stripe";
import Order from "../modals/order.js";
import { CartItem } from "../modals/cartItem.js"; // ✅ CORRECT
import Restaurant from "../modals/restaurantModel.js";
import "dotenv/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================= CREATE ORDER (CHECKOUT) =================
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { address, paymentMethod } = req.body;

    if (!address || !paymentMethod) {
      return res.status(400).json({
        message: "Address and payment method are required",
      });
    }

    // 🛒 Fetch user's cart items
    const cartItems = await CartItem.find({ user: userId }).populate("item");

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 💰 Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum, cart) => sum + cart.item.price * cart.quantity,
      0
    );

    // 📦 Prepare order items
    const orderItems = cartItems.map((cart) => ({
      item: cart.item._id,
      quantity: cart.quantity,
      price: cart.item.price,
    }));

    // 📦 Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      address,
      paymentMethod,
      totalAmount,
      paymentStatus:
        paymentMethod === "cod" ? "pending" : "initiated",
      status: "placed",
    });

    // 🧹 Clear cart
    await CartItem.deleteMany({ user: userId });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({
      message: "Failed to place order",
      error: err.message,
    });
  }
};

// ================= STRIPE CONFIRM =================
export const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id)
      return res.status(400).json({ message: "session_id required" });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const order = await Order.findOne({ sessionId: session_id });
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "succeeded";
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

// ================= GET ORDERS =================
export const getOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({
        owner: req.user._id,
      });

      if (!restaurant) return res.json([]);

      orders = await Order.find({
        "items.item": { $in: restaurant.menu },
      }).sort({ createdAt: -1 });
    } else if (req.user.role === "user") {
      orders = await Order.find({
        user: req.user._id,
      }).sort({ createdAt: -1 });
    } else {
      orders = await Order.find().sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    console.error("getOrders error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= GET ALL (ADMIN) =================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET BY ID =================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role === "user" &&
      !order.user.equals(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= UPDATE ORDER =================
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    Object.assign(order, req.body);
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= ADMIN UPDATE =================
export const updateAnyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    Object.assign(order, req.body);
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
