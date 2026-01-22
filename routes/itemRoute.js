import express from "express";
import authMiddleware from "../middleware/auth.js";
import itemUpload from "../middleware/itemUpload.js";

import {
  createItem,
  getItems,
  getItemsByRestaurant,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

const itemRouter = express.Router();

/* 🌍 PUBLIC */
itemRouter.get("/", getItems);
itemRouter.get("/restaurant/:id", getItemsByRestaurant);

/* 🔐 PROTECTED */
itemRouter.use(authMiddleware(["admin", "restaurant"]));

itemRouter.get("/my-items", getItems);

// ➕ ADD ITEM
itemRouter.post("/", itemUpload.single("image"), createItem);

// ✏️ UPDATE ITEM
itemRouter.put("/:id", itemUpload.single("image"), updateItem);

// ❌ DELETE ITEM
itemRouter.delete("/:id", deleteItem);

export default itemRouter;
