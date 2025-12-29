// routes/itemRoute.js
import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import {
  createItem,
  getItems,
  getItemsByRestaurant,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

const itemRouter = express.Router();

/* =======================
   MULTER CONFIG
======================= */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

/* =======================
   🌍 PUBLIC ROUTES
======================= */

// 🔥 ALL ITEMS (Home / Special Offers)
// ✅ THIS FIXES YOUR 401 ERROR
itemRouter.get("/", getItems);

// 🍽 Items by restaurant (menu page)
itemRouter.get("/restaurant/:id", getItemsByRestaurant);

/* =======================
   🔐 PROTECTED ROUTES
======================= */
itemRouter.use(authMiddleware(["admin", "restaurant"]));

// 🏪 Restaurant/Admin dashboard
itemRouter.get("/my-items", getItems);

// ➕ Add item
itemRouter.post("/", upload.single("image"), createItem);

// ✏️ Update item
itemRouter.put("/:id", upload.single("image"), updateItem);

// ❌ Delete item
itemRouter.delete("/:id", deleteItem);

export default itemRouter;
