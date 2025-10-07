import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import itemRouter from "./routes/itemRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRouter from "./routes/adminRoute.js";
import foodReviewRoutes from "./routes/foodReviewRoutes.js";
import restaurantRouter from "./routes/restaurantRoute.js";

const app = express();
const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Allowed origins
const allowedOrigins = [
  "https://quickbite-frontendapp.netlify.app",
  "https://quickbite-adminapp.netlify.app",
  "http://localhost:5173",
];

// ✅ Global CORS middleware — no app.options() needed!
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
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
  })
);

// ✅ Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect DB
connectDB();

// ✅ Routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/cart", cartRouter);
app.use("/api/items", itemRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/food-review", foodReviewRoutes);

app.get("/", (req, res) => res.send("✅ QuickBite API is working"));

// ✅ Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
