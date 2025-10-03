// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = (roles = null) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ message: "No token provided" });

      const token = authHeader.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token provided" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded._id);
      if (!user) return res.status(401).json({ message: "Invalid token user" });

      req.user = user;

      // Role-based access
      if (roles) {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(user.role)) {
          return res.status(403).json({ message: "Access denied: insufficient role" });
        }
      }

      next();
    } catch (err) {
      console.error("AuthMiddleware error:", err);
      res.status(401).json({ message: "Invalid token", error: err.message });
    }
  };
};

export default authMiddleware;
