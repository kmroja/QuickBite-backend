import express from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/auth.js';
import { 
  createItem, 
  getItems, 
  deleteItem, 
  getMenuByRestaurant 
} from '../controllers/itemController.js';

const itemRouter = express.Router();

// Multer Storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ⭐ Public Route - anyone can view menu items of a restaurant
itemRouter.get("/restaurant/:id", async (req, res) => {
  try {
    const items = await Item.find({ restaurant: req.params.id });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching items" });
  }
});


// ⭐ Protected Routes
itemRouter.use(authMiddleware(["admin", "restaurant"]));

itemRouter.post('/', upload.single('image'), createItem);
itemRouter.get('/', getItems);
itemRouter.delete('/:id', deleteItem);

export default itemRouter;
