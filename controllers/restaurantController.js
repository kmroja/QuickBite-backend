import Restaurant from "../modals/restaurantModel.js";
import path from "path";
import fs from "fs";

// ✅ Helper: Build full image URL
const getFullImageUrl = (req, filename) => {
  const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/${filename}`;
};

// ✅ Create new restaurant
export const createRestaurant = async (req, res) => {
  try {
    const { name, description, address, phone, cuisine, rating, reviews } = req.body;

    if (!name || !address)
      return res.status(400).json({ success: false, message: "Name and address are required" });

    const image = req.file ? getFullImageUrl(req, req.file.filename) : null;

    const restaurantData = {
      name,
      description,
      address,
      phone,
      cuisine,
      rating,
      reviews,
      image,
      owner: req.user?._id || null,
    };

    const restaurant = await Restaurant.create(restaurantData);
    res.status(201).json({ success: true, restaurant });
  } catch (err) {
    console.error("Error creating restaurant:", err);
    res.status(500).json({ success: false, message: "Server error while creating restaurant" });
  }
};

// ✅ Get all restaurants (Public)
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate("owner", "username email role");
    res.json({ success: true, restaurants });
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    res.status(500).json({ success: false, message: "Failed to fetch restaurants" });
  }
};

// ✅ Get single restaurant by ID
// ✅ Get single restaurant by ID WITH MENU
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate("owner", "username email")
      .populate("menu"); // ⭐ ADD THIS

    if (!restaurant)
      return res.status(404).json({ success: false, message: "Restaurant not found" });

    res.json({ success: true, restaurant });
  } catch (err) {
    console.error("Error fetching restaurant:", err);
    res.status(500).json({ success: false, message: "Failed to fetch restaurant" });
  }
};


// ✅ Update restaurant (Admin or Restaurant Owner)
export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant)
      return res.status(404).json({ success: false, message: "Restaurant not found" });

    // Role-based protection
    if (req.user.role !== "admin" && restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updates = { ...req.body };

    if (req.file) {
      if (restaurant.image) {
        const oldPath = path.join("uploads", path.basename(restaurant.image));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.image = getFullImageUrl(req, req.file.filename);
    }

    const updated = await Restaurant.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, restaurant: updated });
  } catch (err) {
    console.error("Error updating restaurant:", err);
    res.status(500).json({ success: false, message: "Failed to update restaurant" });
  }
};

// ✅ Delete restaurant (Admin only)
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant)
      return res.status(404).json({ success: false, message: "Restaurant not found" });

    if (restaurant.image) {
      const imagePath = path.join("uploads", path.basename(restaurant.image));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Restaurant deleted successfully" });
  } catch (err) {
    console.error("Error deleting restaurant:", err);
    res.status(500).json({ success: false, message: "Failed to delete restaurant" });
  }
};
export const applyRestaurant = async (req, res) => {
  try {
    const { name, address, cuisine, description } = req.body;

    if (!name || !address || !cuisine) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const image = req.file ? getFullImageUrl(req, req.file.filename) : null;

    const restaurant = await Restaurant.create({
      name,
      address,
      cuisine,
      description,
      image,
      owner: req.user._id,
      status: "pending",
    });

    res.json({
      success: true,
      message: "Restaurant application submitted. Await admin approval.",
      restaurant,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to apply restaurant" });
  }
};
// ⭐ Get all pending restaurants (Admin Only)
export const getPendingRestaurants = async (req, res) => {
  try {
    const pending = await Restaurant.find({ status: "pending" })
      .populate("owner", "username email");

    res.json({ success: true, pending });
  } catch (err) {
    console.error("Error fetching pending restaurants:", err);
    res.status(500).json({ success: false, message: "Failed to fetch pending restaurants" });
  }
};


// ⭐ Approve restaurant application
export const approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant)
      return res.status(404).json({ success: false, message: "Restaurant not found" });

    if (restaurant.status === "approved") {
      return res.status(400).json({ success: false, message: "Restaurant already approved" });
    }

    restaurant.status = "approved";
    await restaurant.save();

    // ⭐ Convert owner role from "user" → "restaurant"
    await User.findByIdAndUpdate(restaurant.owner, { role: "restaurant" });

    res.json({
      success: true,
      message: "Restaurant approved successfully",
      restaurant,
    });

  } catch (err) {
    console.error("Error approving restaurant:", err);
    res.status(500).json({ success: false, message: "Failed to approve restaurant" });
  }
};
