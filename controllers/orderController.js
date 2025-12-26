import Stripe from "stripe";
import Order from "../modals/order.js";
import { CartItem } from "../modals/cartItem.js";
import Restaurant from "../modals/restaurantModel.js";
import "dotenv/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================= CREATE ORDER =================
export const createOrder = async (req, res) => {
  try {
    // 🔐 Auth check
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
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

    // ✅ Validation
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !email ||
      !address ||
      !city ||
      !zipCode ||
      !items?.length ||
      !paymentMethod
    ) {
      return res.status(400).json({
        message: "Missing required checkout details",
      });
    }

    // ✅ Normalize items for DB
    const orderItems = items.map((i) => ({
      item: {
        name: i.name || "Food Item",
        price: i.price,
        imageUrl: i.imageUrl || "",
        restaurantId: i.restaurantId || null,
      },
      quantity: i.quantity,
    }));

    // ================= ONLINE PAYMENT =================
    if (paymentMethod === "online") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email,
        line_items: items.map((i) => ({
          price_data: {
            currency: "inr",
            product_data: {
              name: i.name || "Food Item",
            },
            unit_amount: Math.round(i.price * 100),
          },
          quantity: i.quantity,
        })),
        success_url: `${process.env.FRONTEND_URL}/checkout?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?payment_status=cancel`,
      });

      const order = await Order.create({
        user: userId,
        firstName,
        lastName,
        phone,
        email,
        address,
        city,
        zipCode,
        items: orderItems,
        subtotal,
        tax,
        total,
        paymentMethod,
        paymentStatus: "pending",
        status: "processing",
        sessionId: session.id,
      });

      // ❌ DO NOT clear cart yet (payment not done)
      return res.status(200).json({
        url: session.url, // ✅ FRONTEND REDIRECT
      });
    }

    // ================= CASH ON DELIVERY =================
    const order = await Order.create({
      user: userId,
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      zipCode,
      items: orderItems,
      subtotal,
      tax,
      total,
      paymentMethod,
      paymentStatus: "pending",
      status: "processing",
    });

    // 🧹 Clear cart immediately for COD
    await CartItem.deleteMany({ user: userId });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("❌ Create order error:", err);
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
      return res.status(400).json({
        message: "session_id is required",
      });
    }

    // 1️⃣ Get Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        message: "Payment not completed",
      });
    }

    // 2️⃣ Find order using sessionId
    const order = await Order.findOne({ sessionId: session_id });

    if (!order) {
      return res.status(404).json({
        message: "Order not found for this session",
      });
    }

    // 3️⃣ Update order
    order.paymentStatus = "succeeded";
    order.status = "confirmed";
    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("❌ Stripe confirm error:", err);
    res.status(500).json({
      message: "Payment confirmation failed",
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
    } else {
      orders = await Order.find({
        user: req.user._id,
      }).sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ================= GET ALL (ADMIN) =================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET BY ID =================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      req.user.role === "user" &&
      !order.user.equals(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= UPDATE ORDER =================
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    Object.assign(order, req.body);
    await order.save();

    res.json(order);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= ADMIN UPDATE =================
export const updateAnyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    Object.assign(order, req.body);
    await order.save();

    res.json(order);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
