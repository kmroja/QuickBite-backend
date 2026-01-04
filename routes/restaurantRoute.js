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
  getMyRestaurant
} from "../controllers/restaurantController.js";

const router = express.Router();

const upload = multer({ dest: "temp/" });


// ======================================================
// ⭐ APPLY FOR RESTAURANT (USER)
// ======================================================
router.post(
  "/apply",
  authMiddleware(["user"]),
  upload.single("image"),
  applyRestaurant
);


// ======================================================
// ⭐ ADMIN ROUTES
// ======================================================
router.get("/pending", authMiddleware(["admin"]), getPendingRestaurants);
router.put("/approve/:id", authMiddleware(["admin"]), approveRestaurant);


// ======================================================
// ⭐ MUST BE BEFORE ANY :id ROUTE
// ⭐ GET RESTAURANT BY OWNER (RESTAURANT DASHBOARD)
// ======================================================
router.get(
  "/owner/:ownerId",
  authMiddleware(["restaurant", "admin"]),
  getRestaurantByOwner
);

router.get(
  "/me",
  authMiddleware(["restaurant", "admin"]),
  getMyRestaurant
);
// ======================================================
// ⭐ PUBLIC ROUTES
// ======================================================
router.get("/", getAllRestaurants);


// ======================================================
// ⭐ ROUTES USING :id (KEEP LAST)
// ======================================================
router.get("/:id", getRestaurantById);

router.post(
  "/",
  authMiddleware(["admin", "restaurant"]),
  upload.single("image"),
  createRestaurant
);
// ======================================================
// ⭐ GET LOGGED-IN RESTAURANT PROFILE
// ======================================================


router.put(
  "/:id",
  authMiddleware(["admin", "restaurant"]),
  upload.single("image"),
  updateRestaurant
);

router.delete("/:id", authMiddleware(["admin"]), deleteRestaurant);


export default router;
