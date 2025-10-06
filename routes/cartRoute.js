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

// GET /api/cart
router.get('/', authMiddleware, (req, res, next) => {
    console.log("➡️ GET /api/cart called by user:", req.user?._id);
    next();
}, getCart);

// POST /api/cart
router.post('/', authMiddleware(), (req, res, next) => {
    console.log("➡️ POST /api/cart called by user:", req.user?._id, "body:", req.body);
    next();
}, addToCart);

// POST /api/cart/clear
router.post('/clear', authMiddleware, (req, res, next) => {
    console.log("➡️ POST /api/cart/clear called by user:", req.user?._id);
    next();
}, clearCart);

// PUT /api/cart/:id
router.put('/:id', authMiddleware, (req, res, next) => {
    console.log(`➡️ PUT /api/cart/${req.params.id} called by user:`, req.user?._id, "body:", req.body);
    next();
}, updateCartItem);

// DELETE /api/cart/:id
router.delete('/:id', authMiddleware, (req, res, next) => {
    console.log(`➡️ DELETE /api/cart/${req.params.id} called by user:`, req.user?._id);
    next();
}, deleteCartItem);

export default router;
