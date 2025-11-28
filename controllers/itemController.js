import Item from "../modals/item.js";
import Restaurant from "../modals/restaurantModel.js";

// ⭐ CREATE ITEM
export const createItem = async (req, res) => {
  try {
    const { name, description, price, restaurantId } = req.body;

    if (!name || !price || !restaurantId) {
      return res.status(400).json({ message: "Name, price, and restaurantId are required" });
    }

    // If restaurant owner → verify ownership
    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findById(restaurantId);

      if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

      if (!restaurant.owner || String(restaurant.owner) !== String(req.user._id)) {
        return res.status(403).json({
          message: "Access denied: You do not own this restaurant",
        });
      }
    }

    const newItem = new Item({
      name,
      description,
      price,
      restaurant: restaurantId,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
    });

    await newItem.save();

    await Restaurant.findByIdAndUpdate(restaurantId, { $push: { menu: newItem._id } });

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Create item error:", err);
    res.status(500).json({ message: "Failed to create item", error: err.message });
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
