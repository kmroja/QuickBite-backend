import express from "express";
import authMiddleware from "../middleware/auth.js";
import User from "../modals/userModel.js";
import Order from "../modals/order.js";
import Item from "../modals/item.js";

const router = express.Router();

// All admin routes require admin role
router.use(authMiddleware(["admin"]));

/**
 * 📊 GET /api/admin/stats
 * Dashboard overview stats
 */
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalItems = await Item.countDocuments(); // count of items
    const pendingOrders = await Order.countDocuments({ status: "processing" });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select("-password");

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("user", "username email");

    res.json({
      totalUsers,
      totalOrders,
      totalItems,
      pendingOrders,
      recentUsers,
      recentOrders,
    });
  } catch (err) {
    console.error("Admin /stats error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch admin stats" });
  }
});

/**
 * 👥 GET /api/admin/users
 * Fetch all users
 */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Admin /users error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

/**
 * 👤 GET /api/admin/users/:id
 * Fetch user details + order count + recent orders
 */
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Count total orders
    const orderCount = await Order.countDocuments({ user: id });

    // Get last 5 orders for that user
    const recentOrders = await Order.find({ user: id })
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      ...user.toObject(),
      orderCount,
      recentOrders,
    });
  } catch (err) {
    console.error("Admin /users/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user details" });
  }
});

/**
 * 🍔 GET /api/admin/items
 * Fetch all items
 */
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Admin /items error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch items" });
  }
});

/**
 * 📦 GET /api/admin/orders
 * Fetch all orders
 */
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "username email");
    res.json(orders);
  } catch (err) {
    console.error("Admin /orders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

/**
 * ✏️ PUT /api/admin/orders/:id
 * Update order status
 */
router.put("/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Admin update order error:", err);
    res.status(500).json({ success: false, message: "Failed to update order" });
  }
});

export default router;
