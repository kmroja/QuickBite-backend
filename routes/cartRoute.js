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

// GET cart
router.get('/', authMiddleware(['user']), getCart);

// ADD item to cart
router.post('/', authMiddleware(['user']), addToCart);

// UPDATE quantity
router.put('/:id', authMiddleware(['user']), updateCartItem);

// DELETE item
router.delete('/:id', authMiddleware(['user']), deleteCartItem);

// CLEAR cart
router.post('/clear', authMiddleware(['user']), clearCart);

export default router;
