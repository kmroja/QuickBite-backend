import express from "express";
import authMiddleware from "../middleware/auth.js";
import uploadRestaurant from "../middleware/uploadRestaurant.js";
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

// ⭐ APPLY
router.post(
  "/apply",
  authMiddleware(["user"]),
  uploadRestaurant.single("image"),
  applyRestaurant
);

// ⭐ ADMIN
router.get("/pending", authMiddleware(["admin"]), getPendingRestaurants);
router.put("/approve/:id", authMiddleware(["admin"]), approveRestaurant);

// ⭐ DASHBOARD
router.get("/owner/:ownerId", authMiddleware(["restaurant", "admin"]), getRestaurantByOwner);
router.get("/me", authMiddleware(["restaurant", "admin"]), getMyRestaurant);

// ⭐ PUBLIC
router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);

// ⭐ CREATE & UPDATE
router.post(
  "/",
  authMiddleware(["admin", "restaurant"]),
  uploadRestaurant.single("image"),
  createRestaurant
);

router.put(
  "/:id",
  authMiddleware(["admin", "restaurant"]),
  uploadRestaurant.single("image"),
  updateRestaurant
);

router.delete("/:id", authMiddleware(["admin"]), deleteRestaurant);

export default router;
