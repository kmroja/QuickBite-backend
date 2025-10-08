// controllers/restaurantController.js
import Restaurant from "../modals/restaurantModel.js";
import Item from "../modals/item.js";

/**
 * ✅ Create new restaurant
 * This version ensures the image is stored as a full public URL (works locally and on Render)
 */
export const createRestaurant = async (req, res) => {
  try {
    const { name, location, cuisineType, description, openingHours } = req.body;

    // Build correct image URL
    let imageUrl = "";
    if (req.file) {
      // dynamically build base URL (localhost or render)
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl; // for manual URL uploads
    }

    const rest = new Restaurant({
      name,
      location,
      cuisineType,
      description,
      openingHours,
      imageUrl,
    });

    await rest.save();
    res.status(201).json(rest);
  } catch (err) {
    console.error("createRestaurant error:", err);
    res.status(500).json({
      message: "Failed to create restaurant",
      error: err.message,
    });
  }
};

/**
 * ✅ Get all restaurants (with populated menu)
 */
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate("menu")
      .sort({ createdAt: -1 });

    res.json(restaurants);
  } catch (err) {
    console.error("getAllRestaurants error:", err);
    res.status(500).json({ message: "Failed to fetch restaurants" });
  }
};

/**
 * ✅ Get a single restaurant by ID (with menu)
 */
export const getRestaurantById = async (req, res) => {
  try {
    const rest = await Restaurant.findById(req.params.id).populate({
      path: "menu",
      options: { sort: { createdAt: -1 } },
    });

    if (!rest) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(rest);
  } catch (err) {
    console.error("getRestaurantById error:", err);
    res.status(500).json({ message: "Failed to fetch restaurant" });
  }
};

/**
 * ✅ Helper: add menu item to restaurant’s menu
 */
export const addMenuItemToRestaurant = async (restaurantId, itemId) => {
  try {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $addToSet: { menu: itemId },
    });
  } catch (err) {
    console.error("addMenuItemToRestaurant error:", err);
  }
};
