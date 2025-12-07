import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  applyRestaurant,
  getPendingRestaurants,
  approveRestaurant,
} from "../controllers/restaurantController.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });


// -------------------------------------------------------------
// ⭐ RESTAURANT OWNER APPLIES (USER ROLE)
// -------------------------------------------------------------
router.post("/apply", authMiddleware(["user"]), upload.single("image"), applyRestaurant);


// -------------------------------------------------------------
// ⭐ ADMIN PANEL ROUTES
// -------------------------------------------------------------
router.get("/pending", authMiddleware(["admin"]), getPendingRestaurants);
router.put("/approve/:id", authMiddleware(["admin"]), approveRestaurant);


// -------------------------------------------------------------
// ⭐ PUBLIC ROUTES
// -------------------------------------------------------------
router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);


// -------------------------------------------------------------
// ⭐ RESTAURANT OWNER ROUTES
// -------------------------------------------------------------
router.post("/", authMiddleware(["admin", "restaurant"]), upload.single("image"), createRestaurant);
router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);
router.put("/:id", authMiddleware(["admin", "restaurant"]), upload.single("image"), updateRestaurant);
router.delete("/:id", authMiddleware(["admin"]), deleteRestaurant);


export default router;
