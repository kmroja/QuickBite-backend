import Stripe from "stripe";
import Order from "../models/order.js";
import { CartItem } from "../models/cartItem.js";
import Restaurant from "../models/restaurantModel.js";
import "dotenv/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================= CREATE ORDER =================
export const createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Unauthorized: user not authenticated",
      });
    }

    const userId = req.user._id;

    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      zipCode,
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !email ||
      !address ||
      !items?.length ||
      !paymentMethod
    ) {
      return res.status(400).json({
        message: "Missing required checkout details",
      });
    }

    // Normalize items to MATCH schema
    const orderItems = items.map((i) => ({
      item: {
        name: i.item.name,
        price: i.item.price,
        imageUrl: i.item.imageUrl,
        restaurantId: i.item.restaurantId,
      },
      quantity: i.quantity,
    }));

    const order = await Order.create({
      user: userId,
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      zipCode,
      items: orderItems,
      subtotal,
      tax,
      shipping: 0,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "initiated",
      status: "processing",
    });

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

    if (!session_id) {
      return res.status(400).json({ message: "session_id required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const order = await Order.findOne({ sessionId: session_id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = "succeeded";
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Stripe confirm error:", err);
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
        "items.item.restaurantId": restaurant._id,
      }).sort({ createdAt: -1 });
    } else if (req.user.role === "user") {
      orders = await Order.find({ user: req.user._id }).sort({
        createdAt: -1,
      });
    } else {
      orders = await Order.find().sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= ADMIN =================
export const getAllOrders = async (_, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

export const updateOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  Object.assign(order, req.body);
  await order.save();
  res.json(order);
};

export const updateAnyOrder = updateOrder;
