import jwt from "jsonwebtoken";

const authMiddleware = (roles = []) => {
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      console.log("Auth header:", authHeader);

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token, authorization denied" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      req.user = {
        _id: decoded._id || decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      if (!req.user._id) {
        console.warn("User ID missing in token!");
        return res.status(400).json({ message: "User not authenticated" });
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "Access denied: insufficient rights" });
      }

      next();
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Session expired, please login again"
            : "Invalid token",
      });
    }
  };
};

export default authMiddleware;
