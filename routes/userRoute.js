import express from "express";
import jwt from "jsonwebtoken";
import {
  loginUser,
  registerUser,
  getProfile,
  getAllUsers,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";
import User from "../modals/userModel.js"; // ✅ Needed for verify route

const userRouter = express.Router();

// 🧑‍💻 Register
userRouter.post("/register", registerUser);

// 🔐 Login
userRouter.post("/login", loginUser);

// 👤 Get logged-in user's profile
userRouter.get("/profile", authMiddleware(), getProfile);

// 👥 Get all users (Admin only)
userRouter.get("/all-users", authMiddleware(["admin"]), getAllUsers);

/**
 * ✅ GET /api/user/verify
 * Used by frontend (PrivateRoute) to verify token validity and fetch user
 */
userRouter.get("/verify", authMiddleware(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error("Token verification error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify user token" });
  }
});

export default userRouter;
