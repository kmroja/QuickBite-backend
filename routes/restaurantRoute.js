// routes/restaurantRoute.js
import express from "express";
import multer from "multer";
import Restaurant from "../modals/restaurantModel.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// 📂 File Upload Setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// 🏪 Create Restaurant (Admin only)
router.post("/", authMiddleware(["admin"]), upload.single("image"), async (req, res) => {
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
    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (err) {
    res.status(500).json({ message: "Failed to create restaurant", error: err.message });
  }
});

// 🍽 Get all restaurants
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate("menu");
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch restaurants" });
  }
});

// 🧾 Get restaurant by ID + menu
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate("menu");
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch restaurant" });
  }
});

export default router;
