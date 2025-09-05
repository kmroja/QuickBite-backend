import jwt from "jsonwebtoken";

const authMiddleware = (roles = []) => {
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
    try {
      const token =
        req.cookies?.token ||
        (req.headers.authorization &&
          req.headers.authorization.split(" ")[1]);

      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "No token, authorization denied" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        _id: decoded._id, // ✅ now always _id
        email: decoded.email,
        role: decoded.role,
      };

      if (roles.length && !roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied: insufficient rights" });
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
