import User from "../models/User.js";
import Order from "../models/Order.js";

// ✅ Dashboard Stats
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });

    res.json({
      users: totalUsers,
      orders: totalOrders,
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
      .populate("userId", "username email"); // include user info
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

// ✅ Recent Users
export const getRecentUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("username email role createdAt");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

// ✅ All Users with Orders Count
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("username email role createdAt");

    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const ordersCount = await Order.countDocuments({ userId: user._id });
        return { ...user.toObject(), ordersCount };
      })
    );

    res.json(usersWithOrders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

// ✅ Single User Details (for popup)
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password"); // hide password
    if (!user) return res.status(404).json({ message: "User not found" });

    const orderCount = await Order.countDocuments({ userId: id });
    const orders = await Order.find({ userId: id })
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 })
      .limit(5); // last 5 orders

    res.json({
      ...user.toObject(),
      orderCount,
      recentOrders: orders,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user details", error: err.message });
  }
};
