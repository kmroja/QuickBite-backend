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
  getRestaurantByOwner,
} from "../controllers/restaurantController.js";

const router = express.Router();

// ------------------- MULTER --------------------
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ----------------- MUST COME FIRST -----------------
// ⭐ Restaurant Owner fetch his own restaurant
router.get(
  "/owner/:ownerId",
  authMiddleware(["restaurant", "admin"]),
  getRestaurantByOwner
);

// ----------------- APPLY FOR RESTAURANT --------------
router.post(
  "/apply",
  authMiddleware(["user"]),
  upload.single("image"),
  applyRestaurant
);

// ----------------- ADMIN ROUTES ----------------------
router.get("/pending", authMiddleware(["admin"]), getPendingRestaurants);
router.put("/approve/:id", authMiddleware(["admin"]), approveRestaurant);

// --------------- PUBLIC ROUTES ------------------------
router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);

// --------------- CRUD (Admin or Owner) ----------------
router.post(
  "/",
  authMiddleware(["admin", "restaurant"]),
  upload.single("image"),
  createRestaurant
);

router.put(
  "/:id",
  authMiddleware(["admin", "restaurant"]),
  upload.single("image"),
  updateRestaurant
);

router.delete("/:id", authMiddleware(["admin"]), deleteRestaurant);

export default router;
