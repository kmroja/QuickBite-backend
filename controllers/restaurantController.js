import Restaurant from "../modals/restaurantModel.js";
import path from "path";
import fs from "fs";
import User from "../modals/userModel.js";
import cloudinary from "../config/cloudinary.js";
// ✅ Helper: Build full image URL
export const createRestaurant = async (req, res) => {
  try {
    const { name, description, address, phone, cuisine } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: "Required fields missing" });
    }
let imageUrl = "";

if (req.file) {
  imageUrl = req.file.path; // Cloudinary URL
}


    const restaurant = await Restaurant.create({
      name,
      description,
      address,
      phone,
      cuisine,
      image: imageUrl,
      owner: req.user._id,
    });

    res.status(201).json({ success: true, restaurant });
  } catch (err) {
    res.status(500).json({ message: "Failed to create restaurant" });
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
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    // 🔐 Role check
    if (
      req.user.role !== "admin" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Update fields
    const { name, description, cuisine, address } = req.body;
    if (name) restaurant.name = name;
    if (description) restaurant.description = description;
    if (cuisine) restaurant.cuisine = cuisine;
    if (address) restaurant.address = address;

    // 🖼 Upload to Cloudinary
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "quickbite/restaurants" }
      );

      restaurant.image = uploadResult.secure_url;
    }

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    console.error("❌ Update Restaurant Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update restaurant",
    });
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
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Approve restaurant
    restaurant.status = "approved";
    await restaurant.save();

    // Update user role
    const user = await User.findByIdAndUpdate(
      restaurant.owner,
      { role: "restaurant" },
      { new: true }
    );

    res.json({
      success: true,
      message: "Restaurant approved successfully",
      user,
      restaurant
    });

  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ message: "Error approving restaurant" });
  }
};

// ⭐ GET RESTAURANT BY OWNER (Restaurant Dashboard)
export const getRestaurantByOwner = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    const restaurant = await Restaurant.findOne({ owner: ownerId });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "No restaurant found for this owner",
      });
    }

    res.json({ success: true, restaurant });
  } catch (err) {
    console.error("Owner Restaurant Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ⭐ GET LOGGED-IN RESTAURANT (ME)
export const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found for this account",
      });
    }

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (err) {
    console.error("GET /restaurants/me error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant",
    });
  }
};

