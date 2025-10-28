import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import {
  applyForRestaurant,
  getAllApplications,
  approveApplication,
  rejectApplication,
} from "../controllers/restaurantApplicationController.js";

import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ✅ ES Module-compatible __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// 🌍 Public route
router.post("/apply", upload.single("image"), applyForRestaurant);

// 🧑‍💼 Admin routes
router.get("/", authMiddleware, adminMiddleware, getAllApplications);
router.put("/:id/approve", authMiddleware, adminMiddleware, approveApplication);
router.put("/:id/reject", authMiddleware, adminMiddleware, rejectApplication);

export default router;
