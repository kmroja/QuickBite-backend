// server/middleware/authMiddleware.js
// middleware/auth.js
// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../modals/userModel.js";

const authMiddleware = (roles = null) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded._id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Role-based access
      if (roles) {
        const allowed = Array.isArray(roles) ? roles : [roles];
        if (!allowed.includes(user.role)) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      req.user = user;
      next();
    } catch (err) {
      console.error("Auth error:", err.message);
      return res.status(401).json({ message: "Authentication failed" });
    }
  };
};

export default authMiddleware;

/* ✅ ADD THIS BACK */
export const adminMiddleware = authMiddleware(["admin"]);





// import jwt from "jsonwebtoken";
// import User from "../modals/userModel.js";

// const authMiddleware = (roles = null) => {
//   return async (req, res, next) => {
//     console.log("🔐 authMiddleware started for:", req.path);

//     try {
//       const authHeader = req.headers.authorization;
//       if (!authHeader) {
//         console.log("🔐 No token provided in header");
//         return res.status(401).json({ message: "No token provided" });
//       }

//       const token = authHeader.split(" ")[1];
//       if (!token) {
//         console.log("🔐 Token missing after Bearer");
//         return res.status(401).json({ message: "No token provided" });
//       }

//       console.log("🔐 Verifying JWT token...");
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log("🔐 JWT verified, user ID:", decoded._id);

//       // Fetch user with a timeout to avoid hanging
//       const userQuery = User.findById(decoded._id).lean();
//       const user = await Promise.race([
//         userQuery,
//         new Promise((_, reject) =>
//           setTimeout(() => reject(new Error("DB query timeout")), 5000)
//         )
//       ]);

//       if (!user) {
//         console.log("🔐 User not found for token");
//         return res.status(401).json({ message: "Invalid token user" });
//       }

//       console.log("🔐 User fetched:", user._id, "role:", user.role);
//       req.user = user;

//       if (roles) {
//         const allowedRoles = Array.isArray(roles) ? roles : [roles];
//         if (!allowedRoles.includes(user.role)) {
//           console.log("🔐 Access denied due to role");
//           return res.status(403).json({ message: "Access denied: insufficient role" });
//         }
//       }

//       console.log("🔐 authMiddleware success, calling next()");
//       next();
//     } catch (err) {
//       console.error("🔐 AuthMiddleware error:", err.message);
//       if (err.message === "DB query timeout") {
//         return res.status(500).json({ message: "Database timeout - please try again" });
//       }
//       res.status(401).json({ message: "Invalid token", error: err.message });
//     }
//   };
// };

// export default authMiddleware;

