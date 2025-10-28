import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurantController.js";

const router = express.Router();

// 📂 Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// 🏪 Routes
router.post("/", authMiddleware(["admin", "restaurant"]), upload.single("image"), createRestaurant);
router.get("/", getAllRestaurants); // public
router.get("/:id", getRestaurantById);
router.put("/:id", authMiddleware(["admin", "restaurant"]), upload.single("image"), updateRestaurant);
router.delete("/:id", authMiddleware(["admin"]), deleteRestaurant);

export default router;
