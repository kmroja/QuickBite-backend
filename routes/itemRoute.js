// routes/itemRoutes.js
import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import {
  createItem,
  getItems,
  deleteItem,
  getItemsByRestaurant
} from "../controllers/itemController.js";

const itemRouter = express.Router();

// ⭐ Multer Setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });


// --------------------------------------------------------
// ⭐ PUBLIC ROUTE → Anyone can view menu of a restaurant
// --------------------------------------------------------
itemRouter.get("/restaurant/:id", getItemsByRestaurant);


// --------------------------------------------------------
// ⭐ PROTECTED ROUTES → Only ADMIN + RESTAURANT owner
// --------------------------------------------------------
itemRouter.use(authMiddleware(["admin", "restaurant"]));

itemRouter.post("/", upload.single("image"), createItem);
itemRouter.get("/", getItems);
itemRouter.delete("/:id", deleteItem);


export default itemRouter;
