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

import Restaurant from "../modals/restaurantModel.js";

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
// ⭐ ORDER OF ROUTES MATTERS
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
// ⭐ RESTAURANT OWNER FETCH HIS RESTAURANT
//    (PLACE **BEFORE** `/:id` ROUTE)
// -------------------------------------------------------------
router.get(
  "/owner/:userId",
  authMiddleware(["restaurant", "admin"]),
  async (req, res) => {
    try {
      const restaurant = await Restaurant.findOne({
        owner: req.params.userId,
      });

      if (!restaurant) {
        return res
          .status(404)
          .json({ success: false, message: "Restaurant not found" });
      }

      res.json({ success: true, restaurant });
    } catch (err) {
      console.error("Error fetching restaurant:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// -------------------------------------------------------------
// ⭐ PUBLIC ROUTES
// -------------------------------------------------------------
router.get("/", getAllRestaurants);

// -------------------------------------------------------------
// ⭐ ROUTES USING ID (MUST BE LAST)
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

// -------------------------------------------------------------
// ❌ REMOVE DUPLICATE OWNER ROUTE
// -------------------------------------------------------------
// router.get("/owner/:ownerId", authMiddleware, getRestaurantByOwner);

export default router;
