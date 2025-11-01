// routes/restaurantApplicationRoute.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import {
  applyForRestaurant,
  getAllApplications,
  getPendingApplications,
  approveApplication,
  rejectApplication,
} from "../controllers/restaurantApplicationController.js";

import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* ✅ ES Module-compatible __dirname setup                                    */
/* -------------------------------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* -------------------------------------------------------------------------- */
/* ✅ Multer setup for image uploads                                          */
/* -------------------------------------------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* -------------------------------------------------------------------------- */
/* 🌍 Public Route: Restaurant Application Submission                         */
/* -------------------------------------------------------------------------- */
router.post("/apply", upload.single("image"), applyForRestaurant);

/* -------------------------------------------------------------------------- */
/* 🧑‍💼 Admin Routes (Protected)                                             */
/* -------------------------------------------------------------------------- */

// ✅ Get all applications (approved + rejected + pending)
router.get("/", authMiddleware, adminMiddleware, getAllApplications);

// ✅ Get only pending applications
router.get("/pending", authMiddleware, adminMiddleware, getPendingApplications);

// ✅ Approve an application
router.put("/:id/approve", authMiddleware, adminMiddleware, approveApplication);

// ✅ Reject an application
router.put("/:id/reject", authMiddleware, adminMiddleware, rejectApplication);

export default router;
