import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} from '../controllers/cartController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * ==========================
 * CART ROUTES (USER ONLY)
 * ==========================
 */

// GET /api/cart
router.get(
  '/',
  authMiddleware(['user']),
  (req, res, next) => {
    console.log("➡️ GET /api/cart by user:", req.user._id);
    next();
  },
  getCart
);

// POST /api/cart (Add item)
router.post(
  '/',
  authMiddleware(['user']),
  (req, res, next) => {
    console.log(
      "➡️ POST /api/cart by user:",
      req.user._id,
      "body:",
      req.body
    );
    next();
  },
  addToCart
);

// PUT /api/cart/:id (Update quantity)
router.put(
  '/:id',
  authMiddleware(['user']),
  (req, res, next) => {
    console.log(
      `➡️ PUT /api/cart/${req.params.id} by user:`,
      req.user._id,
      "quantity:",
      req.body.quantity
    );
    next();
  },
  updateCartItem
);

// DELETE /api/cart/:id
router.delete(
  '/:id',
  authMiddleware(['user']),
  (req, res, next) => {
    console.log(
      `➡️ DELETE /api/cart/${req.params.id} by user:`,
      req.user._id
    );
    next();
  },
  deleteCartItem
);

// POST /api/cart/clear
router.post(
  '/clear',
  authMiddleware(['user']),
  (req, res, next) => {
    console.log("➡️ POST /api/cart/clear by user:", req.user._id);
    next();
  },
  clearCart
);

export default router;
