import Item from "../modals/item.js";
import Restaurant from "../modals/restaurantModel.js"; // <-- import restaurant model

// ---------------- CREATE ITEM ----------------
export const createItem = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
      rating,
      hearts,
      restaurant, // <-- new optional field
    } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const total = Number(price) * 1;

    const newItem = new Item({
      name,
      description,
      category,
      price,
      rating,
      hearts,
      imageUrl,
      total,
      restaurant: restaurant || null, // optional link to restaurant
    });

    const saved = await newItem.save();

    // 🔗 If restaurant ID provided, add this item to that restaurant's menu array
    if (restaurant) {
      try {
        await Restaurant.findByIdAndUpdate(restaurant, {
          $addToSet: { menu: saved._id },
        });
      } catch (err) {
        console.warn("⚠️ Failed to add item to restaurant.menu:", err.message);
      }
    }

    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: "Item name already exists" });
    } else next(err);
  }
};

// ---------------- GET ITEMS ----------------
export const getItems = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurant = req.query.restaurantId;

    const items = await Item.find(filter).sort({ createdAt: -1 });
    const host = `${req.protocol}://${req.get("host")}`;

    const withFullUrl = items.map((i) => ({
      ...i.toObject(),
      imageUrl: i.imageUrl ? host + i.imageUrl : "",
    }));

    res.json(withFullUrl);
  } catch (err) {
    next(err);
  }
};

// ---------------- DELETE ITEM ----------------
export const deleteItem = async (req, res, next) => {
  try {
    const removed = await Item.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "Item not found" });

    // If deleted item belongs to a restaurant, remove it from that menu
    if (removed.restaurant) {
      try {
        await Restaurant.findByIdAndUpdate(removed.restaurant, {
          $pull: { menu: removed._id },
        });
      } catch (err) {
        console.warn("⚠️ Failed to remove item from restaurant.menu:", err.message);
      }
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
