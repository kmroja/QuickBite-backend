import express from "express";
import authMiddleware from "../middleware/auth.js";
import User from "../modals/userModel.js";
import Order from "../modals/order.js";
import Item from "../modals/item.js";

const router = express.Router();

// All admin routes require admin role
router.use(authMiddleware(["admin"]));

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalItems = await Item.countDocuments(); // count of items
    const pendingOrders = await Order.countDocuments({ status: "processing" });

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(6).select("-password");
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("user", "username email"); // only populate user

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

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Admin /users error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// GET /api/admin/items
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Admin /items error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch items" });
  }
});

// GET /api/admin/orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "username email"); // no populate for items
    res.json(orders);
  } catch (err) {
    console.error("Admin /orders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

// PUT /api/admin/orders/:id -> update order status
router.put("/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Order not found" });
    res.json(updated);
  } catch (err) {
    console.error("Admin update order error:", err);
    res.status(500).json({ success: false, message: "Failed to update order" });
  }
});

export default router;
