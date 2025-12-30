import mongoose from "mongoose";
import Item from "../modals/item.js";
import Restaurant from "../modals/restaurantModel.js";
import cloudinary from "../config/cloudinary.js";

// ⭐ CREATE ITEM
export const createItem = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    let restaurantId;

    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) {
        return res.status(400).json({ message: "No restaurant linked" });
      }
      restaurantId = restaurant._id;
    }

    if (req.user.role === "admin") {
      if (!mongoose.Types.ObjectId.isValid(req.body.restaurantId)) {
        return res.status(400).json({ message: "Invalid restaurantId" });
      }
      restaurantId = req.body.restaurantId;
    }

    let imageUrl = "";
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "quickbite/items",
      });
      imageUrl = upload.secure_url;
    }

    const newItem = await Item.create({
      name,
      description,
      price,
      category,
      restaurant: restaurantId,
      imageUrl,
    });

    await Restaurant.findByIdAndUpdate(restaurantId, {
      $push: { menu: newItem._id },
    });

    res.status(201).json({ success: true, item: newItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create item" });
  }
};


// ⭐ GET ITEMS (PUBLIC + DASHBOARD FIXED)
export const getItems = async (req, res) => {
  try {
    let items;

    // 🌍 PUBLIC ACCESS (Home / Special Offers)
    if (!req.user) {
      items = await Item.find()
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });

      return res.json({ success: true, items });
    }

    // 🔐 RESTAURANT DASHBOARD
    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) return res.json({ success: true, items: [] });

      items = await Item.find({ restaurant: restaurant._id })
        .sort({ createdAt: -1 });
    }

    // 🔐 ADMIN DASHBOARD
    else {
      items = await Item.find().sort({ createdAt: -1 });
    }

    res.json({ success: true, items });
  } catch (err) {
    console.error("Get items error:", err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
};

// ⭐ PUBLIC MENU VIEW — restaurant page
export const getItemsByRestaurant = async (req, res) => {
  try {
    const items = await Item.find({ restaurant: req.params.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch menu" });
  }
};

// ⭐ DELETE ITEM
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant || String(item.restaurant) !== String(restaurant._id)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    await Item.findByIdAndDelete(req.params.id);
    await Restaurant.findByIdAndUpdate(item.restaurant, {
      $pull: { menu: item._id },
    });

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item" });
  }
};

// ⭐ UPDATE ITEM
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant || String(item.restaurant) !== String(restaurant._id)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    item.name = req.body.name || item.name;
    item.description = req.body.description || item.description;
    item.price = req.body.price || item.price;
    item.category = req.body.category || item.category;

    if (req.file) {
      item.imageUrl = `/uploads/${req.file.filename}`;
    }

    await item.save();
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ message: "Failed to update item" });
  }
};
