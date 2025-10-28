// import express from "express";
// import jwt from "jsonwebtoken";
// import {
//   loginUser,
//   registerUser,
//   getProfile,
//   getAllUsers,
// } from "../controllers/userController.js";
// import authMiddleware from "../middleware/auth.js";
// import User from "../modals/userModel.js"; // ✅ Needed for verify route

// const userRouter = express.Router();

// // 🧑‍💻 Register
// userRouter.post("/register", registerUser);

// // 🔐 Login
// userRouter.post("/login", loginUser);

// // 👤 Get logged-in user's profile
// userRouter.get("/profile", authMiddleware(), getProfile);

// // 👥 Get all users (Admin only)
// userRouter.get("/all-users", authMiddleware(["admin"]), getAllUsers);

// /**
//  * ✅ GET /api/user/verify
//  * Used by frontend (PrivateRoute) to verify token validity and fetch user
//  */
// userRouter.get("/verify", authMiddleware(), async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("-password");
//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });

//     res.json({ success: true, user });
//   } catch (err) {
//     console.error("Token verification error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to verify user token" });
//   }
// });

// export default userRouter;

import express from "express";
import jwt from "jsonwebtoken";
import {
  loginUser,
  registerUser,
  getProfile,
  getAllUsers,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";
import User from "../modals/userModel.js";

const userRouter = express.Router();

/**
 * 🧑‍💻 Register a new user
 * Body: { name, email, password, role }
 * role: "user" | "admin" | "restaurantAdmin"
 */
userRouter.post("/register", registerUser);

/**
 * 🔐 Login
 * Body: { email, password }
 * Returns JWT token + user data
 */
userRouter.post("/login", loginUser);

/**
 * 👤 Get profile of currently logged-in user
 */
userRouter.get("/profile", authMiddleware(), getProfile);

/**
 * 👥 Get all users (Admin only)
 */
userRouter.get("/all-users", authMiddleware(["admin"]), getAllUsers);

/**
 * ✅ Verify user token and role
 * Used by frontend to keep user logged in
 */
userRouter.get("/verify", authMiddleware(), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ Important: Send the role to frontend
      },
    });
  } catch (err) {
    console.error("Token verification error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify user token" });
  }
});

/**
 * 🧾 Optional: Verify specific roles (for dashboard access)
 * Example: /api/user/verify-role/admin
 */
userRouter.get(
  "/verify-role/:role",
  authMiddleware(),
  async (req, res) => {
    const { role } = req.params;
    try {
      const user = await User.findById(req.user._id);
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

      const hasAccess =
        user.role === role ||
        (role === "admin" && user.role === "admin");

      res.json({
        success: hasAccess,
        message: hasAccess
          ? `Access granted for ${role}`
          : `Access denied for ${role}`,
        role: user.role,
      });
    } catch (err) {
      console.error("Role verification error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

export default userRouter;
