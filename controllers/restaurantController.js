// controllers/restaurantController.js
import Restaurant from "../modals/restaurantModel.js"; // adjust path to match your repo
import Item from "../modals/item.js";

export const createRestaurant = async (req, res) => {
  try {
    const { name, location, cuisineType, description, openingHours } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || "";

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
    res.status(500).json({ message: "Failed to create restaurant", error: err.message });
  }
};

export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate("menu").sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (err) {
    console.error("getAllRestaurants error:", err);
    res.status(500).json({ message: "Failed to fetch restaurants" });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const rest = await Restaurant.findById(req.params.id).populate({
      path: "menu",
      options: { sort: { createdAt: -1 } },
    });
    if (!rest) return res.status(404).json({ message: "Restaurant not found" });
    res.json(rest);
  } catch (err) {
    console.error("getRestaurantById error:", err);
    res.status(500).json({ message: "Failed to fetch restaurant" });
  }
};

// optional: add a method to push item to restaurant.menu when item is created
export const addMenuItemToRestaurant = async (restaurantId, itemId) => {
  try {
    await Restaurant.findByIdAndUpdate(restaurantId, { $addToSet: { menu: itemId } });
  } catch (err) {
    console.error("addMenuItemToRestaurant error:", err);
  }
};
