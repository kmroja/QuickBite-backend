import express from "express";
import {
  applyForRestaurant,
  getAllApplications,
  getPendingApplications,
  approveApplication,
  rejectApplication,
} from "../controllers/restaurantApplicationController.js";
import upload from "../middleware/uploadRestaurant.js";
import authMiddleware, { adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ✅ USER MUST BE LOGGED IN
router.post(
  "/apply",
  authMiddleware(["user"]),
  upload.single("image"),
  applyForRestaurant
);

// 🔐 Admin routes
router.get("/", adminMiddleware, getAllApplications);
router.get("/pending", adminMiddleware, getPendingApplications);
router.patch("/:id/approve", adminMiddleware, approveApplication);
router.patch("/:id/reject", adminMiddleware, rejectApplication);

export default router;
