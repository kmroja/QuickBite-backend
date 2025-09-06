import jwt from "jsonwebtoken";

const authMiddleware = (roles = []) => {
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token, authorization denied" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role,
      };

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
