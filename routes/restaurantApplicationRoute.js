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

import { adminMiddleware } from "../middleware/auth.js"; // ✅ Only need adminMiddleware here

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
// Anyone can apply — no auth required
router.post("/apply", upload.single("image"), applyForRestaurant);

/* -------------------------------------------------------------------------- */
/* 🧑‍💼 Admin Routes (Protected by JWT + Role Check)                          */
/* -------------------------------------------------------------------------- */

// ✅ Get all applications (approved + rejected + pending)
router.get("/", adminMiddleware, getAllApplications);

// ✅ Get only pending applications
router.get("/pending", adminMiddleware, getPendingApplications);

// ✅ Approve an application
router.put("/:id/approve", adminMiddleware, approveApplication);

// ✅ Reject an application
router.put("/:id/reject", adminMiddleware, rejectApplication);

export default router;
