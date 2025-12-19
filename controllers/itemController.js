import Item from "../modals/item.js";
import Restaurant from "../modals/restaurantModel.js";

// ⭐ CREATE ITEM

export const createItem = async (req, res) => {
  try {
    console.log("USER 👉", req.user);
    console.log("BODY 👉", req.body);

    const { name, description, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "name and price are required",
      });
    }

    let restaurantId;

    // ✅ RESTAURANT OWNER FLOW
    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({
        owner: req.user._id,
      });

      if (!restaurant) {
        return res.status(400).json({
          message: "No restaurant linked to this account",
        });
      }

      restaurantId = restaurant._id;
    }

    // ✅ ADMIN FLOW (optional)
    if (req.user.role === "admin") {
      if (!req.body.restaurantId) {
        return res.status(400).json({
          message: "restaurantId is required for admin",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(req.body.restaurantId)) {
        return res.status(400).json({
          message: "Invalid restaurantId",
        });
      }

      restaurantId = req.body.restaurantId;
    }

    const newItem = await Item.create({
      name,
      description,
      price,
      restaurant: restaurantId,
      imageUrl: req.file?.filename || "",
    });

    await Restaurant.findByIdAndUpdate(restaurantId, {
      $push: { menu: newItem._id },
    });

    res.status(201).json({
      success: true,
      item: newItem,
    });
  } catch (err) {
    console.error("Create item error:", err);
    res.status(500).json({
      message: "Failed to create item",
      error: err.message,
    });
  }
};


// ⭐ GET ITEMS (admin or restaurant dashboard)
export const getItems = async (req, res) => {
  try {
    let items;

    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) return res.json([]);

      items = await Item.find({ restaurant: restaurant._id }).sort({ createdAt: -1 });
    } else {
      items = await Item.find().sort({ createdAt: -1 });
    }

    res.json(items);
  } catch (err) {
    console.error("Get items error:", err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
};

// ⭐ PUBLIC MENU VIEW — anyone can see restaurant menu
export const getMenuByRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;

    const items = await Item.find({ restaurant: restaurantId }).sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (err) {
    console.error("Get menu error:", err);
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
        return res.status(403).json({
          message: "Access denied: cannot delete this item",
        });
      }
    }

    await Item.findByIdAndDelete(req.params.id);

    await Restaurant.findByIdAndUpdate(item.restaurant, {
      $pull: { menu: item._id },
    });

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Delete item error:", err);
    res.status(500).json({ message: "Failed to delete item" });
  }
};
// GET MENU ITEMS FOR SPECIFIC RESTAURANT (Public)
export const getItemsByRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const items = await Item.find({ restaurant: restaurantId }).sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (err) {
    console.error("Error fetching restaurant menu:", err);
    res.status(500).json({ success: false, message: "Failed to fetch menu" });
  }
};

// ⭐ UPDATE ITEM
export const updateItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 🔐 Restaurant ownership check
    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });

      if (!restaurant || String(item.restaurant) !== String(restaurant._id)) {
        return res.status(403).json({
          message: "Access denied: You cannot update this item",
        });
      }
    }

    // Update fields
    item.name = req.body.name || item.name;
    item.description = req.body.description || item.description;
    item.price = req.body.price || item.price;
    item.category = req.body.category || item.category;

    // If new image uploaded
    if (req.file) {
      item.imageUrl = `/uploads/${req.file.filename}`;
    }

    await item.save();

    res.json({ success: true, item });
  } catch (err) {
    console.error("Update item error:", err);
    res.status(500).json({ message: "Failed to update item" });
  }
};
