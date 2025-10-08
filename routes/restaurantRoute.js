// routes/restaurantRoute.js
import express from "express";
import multer from "multer";
import Restaurant from "../modals/restaurantModel.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// File upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// CREATE restaurant
// Admin can create for anyone; a user with role 'restaurant' can create their own restaurant (owner set to them)
router.post("/", authMiddleware(["admin", "restaurant"]), upload.single("image"), async (req, res) => {
  try {
    const { name, location, cuisineType, description, openingHours } = req.body;

    const newRestaurant = new Restaurant({
      name,
      location,
      cuisineType,
      description,
      openingHours,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
    });

    // If the requester is a restaurant user, set them as owner
    if (req.user && String(req.user.role).toLowerCase() === "restaurant") {
      newRestaurant.owner = req.user._id;
    }

    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (err) {
    console.error("POST /api/restaurants error:", err);
    res.status(500).json({ message: "Failed to create restaurant", error: err.message });
  }
});

// GET all restaurants (public)
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate("menu").sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (err) {
    console.error("GET /api/restaurants error:", err);
    res.status(500).json({ message: "Failed to fetch restaurants" });
  }
});

// GET single restaurant
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate({
      path: "menu",
      options: { sort: { createdAt: -1 } },
    });

    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (err) {
    console.error("GET /api/restaurants/:id error:", err);
    res.status(500).json({ message: "Failed to fetch restaurant" });
  }
});

// UPDATE restaurant
// ADMIN can update any; RESTAURANT can update only their own (owner)
router.put("/:id", authMiddleware(["admin", "restaurant"]), upload.single("image"), async (req, res) => {
  try {
    const rest = await Restaurant.findById(req.params.id);
    if (!rest) return res.status(404).json({ message: "Restaurant not found" });

    // If requester is restaurant, check ownership
    if (String(req.user.role).toLowerCase() === "restaurant") {
      if (!rest.owner || String(rest.owner) !== String(req.user._id)) {
        return res.status(403).json({ message: "Access denied: not the owner" });
      }
    }

    const { name, location, cuisineType, description, openingHours } = req.body;
    if (name) rest.name = name;
    if (location) rest.location = location;
    if (cuisineType) rest.cuisineType = cuisineType;
    if (description) rest.description = description;
    if (openingHours) rest.openingHours = openingHours;
    if (req.file) rest.imageUrl = `/uploads/${req.file.filename}`;

    await rest.save();
    res.json(rest);
  } catch (err) {
    console.error("PUT /api/restaurants/:id error:", err);
    res.status(500).json({ message: "Failed to update restaurant", error: err.message });
  }
});

// DELETE restaurant - ADMIN only
router.delete("/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const removed = await Restaurant.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "Restaurant not found" });
    res.json({ message: "Restaurant deleted" });
  } catch (err) {
    console.error("DELETE /api/restaurants/:id error:", err);
    res.status(500).json({ message: "Failed to delete restaurant" });
  }
});

export default router;
