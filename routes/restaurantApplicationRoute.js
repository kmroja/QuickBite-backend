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
import upload from "../middleware/cloudinaryUpload.js";
import { adminMiddleware } from "../middleware/auth.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



router.post("/apply", upload.single("image"), applyForRestaurant);

// Admin protected
router.get("/", adminMiddleware, getAllApplications);
router.get("/pending", adminMiddleware, getPendingApplications);
router.patch("/:id/approve", adminMiddleware, approveApplication);
router.patch("/:id/reject", adminMiddleware, rejectApplication);

export default router;
