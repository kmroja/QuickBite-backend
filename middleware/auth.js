import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = (roles = null) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: "Invalid token user" });
      }

      // Role check
      if (roles) {
        // normalize into array
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({ message: "Access denied: Insufficient role" });
        }
      }

      next();
    } catch (err) {
      console.error("Auth error:", err);
      res.status(401).json({ message: "Invalid token", error: err.message });
    }
  };
};

export default authMiddleware;
