import User from "../models/User.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";

// ✅ Dashboard Stats
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });

    res.json({
      users: totalUsers,
      orders: totalOrders,
      restaurants: totalRestaurants,
      pendingOrders,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
};

// ✅ Recent Orders
export const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "username email") // include user info
      .populate("restaurantId", "name");   // include restaurant info
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

// ✅ Recent Users
export const getRecentUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};
