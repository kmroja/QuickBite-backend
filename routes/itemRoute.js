// routes/itemRoute.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import upload from "../middleware/cloudinaryUpload.js";

import {
  createItem,
  getItems,
  getItemsByRestaurant,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

const itemRouter = express.Router();

/* =======================
   🌍 PUBLIC ROUTES
======================= */

// 🔥 All items (Home / Special Menu)
itemRouter.get("/", getItems);

// 🍽 Items by restaurant (menu page)
itemRouter.get("/restaurant/:id", getItemsByRestaurant);

/* =======================
   🔐 PROTECTED ROUTES
======================= */
itemRouter.use(authMiddleware(["admin", "restaurant"]));

// 🏪 Dashboard items
itemRouter.get("/my-items", getItems);

// ➕ Add item (Cloudinary image upload)
itemRouter.post("/", upload.single("image"), createItem);

// ✏️ Update item
itemRouter.put("/:id", upload.single("image"), updateItem);

// ❌ Delete item
itemRouter.delete("/:id", deleteItem);

export default itemRouter;
