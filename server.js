import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

// 🧩 Import Routes
import userRouter from "./routes/userRoute.js";
import adminRouter from "./routes/adminRoute.js";
import cartRouter from "./routes/cartRoute.js";
import itemRouter from "./routes/itemRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import foodReviewRoutes from "./routes/foodReviewRoutes.js";
import restaurantRouter from "./routes/restaurantRoute.js";
import restaurantApplicationRouter from "./routes/restaurantApplicationRoute.js";
const app = express();
const port = process.env.PORT || 4000;

// ✅ Resolve directory for static path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Connect MongoDB
connectDB();

// ✅ CORS Configuration
const allowedOrigins = [
  "https://quickbite-frontendapp.netlify.app",
  "https://quickbite-adminapp.netlify.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve Uploaded Files Publicly (for restaurant images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/cart", cartRouter);
app.use("/api/items", itemRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/food-review", foodReviewRoutes);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/restaurant-applications", restaurantApplicationRouter);
app.use("/uploads", express.static("uploads"));

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("✅ QuickBite API is running successfully.");
});

// ✅ Error Handling (optional but recommended)
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
