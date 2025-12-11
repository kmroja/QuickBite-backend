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
  getRestaurantByOwner
} from "../controllers/restaurantController.js";

const router = express.Router();

// ------------------------------------
// MULTER SETUP
// ------------------------------------
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ===================================================================
// ⭐ ORDER OF ROUTES IMPORTANT
// ===================================================================

// -------------------------------------------------------------
// ⭐ RESTAURANT OWNER APPLY
// -------------------------------------------------------------
router.post(
  "/apply",
  authMiddleware(["user"]),
  upload.single("image"),
  applyRestaurant
);

// -------------------------------------------------------------
// ⭐ ADMIN ROUTES
// -------------------------------------------------------------
router.get("/pending", authMiddleware(["admin"]), getPendingRestaurants);
router.put("/approve/:id", authMiddleware(["admin"]), approveRestaurant);

// -------------------------------------------------------------
// ⭐ RESTAURANT OWNER FETCH HIS OWN RESTAURANT (Dashboard)
// -------------------------------------------------------------
// ONLY THIS ROUTE — remove duplicates
router.get(
  "/owner/:ownerId",
  authMiddleware(["restaurant"]),
  getRestaurantByOwner
);

// -------------------------------------------------------------
// ⭐ PUBLIC ROUTES
// -------------------------------------------------------------
router.get("/", getAllRestaurants);

// -------------------------------------------------------------
// ⭐ ROUTES USING :id (must be last)
// -------------------------------------------------------------
router.get("/:id", getRestaurantById);

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
