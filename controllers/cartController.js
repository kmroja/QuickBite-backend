import asyncHandler from 'express-async-handler';
import { CartItem } from '../modals/cartItem.js';

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
    console.log("GET /api/cart called by user:", req.user?._id);

    if (!req.user?._id) {
        return res.status(400).json({ message: "User not authenticated" });
    }

    try {
        const items = await CartItem.find({ user: req.user._id }).populate('item');
        console.log("Cart items fetched:", items.length);

        const formatted = items.map(ci => ({
            _id: ci._id.toString(),
            item: ci.item || null,
            quantity: ci.quantity,
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Error in getCart:", err);
        res.status(500).json({ message: "Failed to fetch cart" });
    }
});

// POST /api/cart
export const addToCart = asyncHandler(async (req, res) => {
    const { itemId, quantity } = req.body;
    console.log("POST /api/cart called by user:", req.user?._id, "with body:", req.body);

    if (!req.user?._id) return res.status(400).json({ message: "User not authenticated" });
    if (!itemId || typeof quantity !== 'number') {
        res.status(400);
        throw new Error('itemId and quantity (number) are required');
    }

    try {
        let cartItem = await CartItem.findOne({ user: req.user._id, item: itemId });

        if (cartItem) {
            cartItem.quantity = Math.max(1, cartItem.quantity + quantity);
            if (cartItem.quantity < 1) {
                await cartItem.remove();
                console.log("Cart item removed due to quantity < 1:", cartItem._id);
                return res.json({ _id: cartItem._id.toString(), item: cartItem.item, quantity: 0 });
            }
            await cartItem.save();
            await cartItem.populate('item');
            console.log("Cart item updated:", cartItem._id);
            return res.status(200).json({
                _id: cartItem._id.toString(),
                item: cartItem.item || null,
                quantity: cartItem.quantity,
            });
        }

        cartItem = await CartItem.create({
            user: req.user._id,
            item: itemId,
            quantity,
        });
        await cartItem.populate('item');
        console.log("Cart item created:", cartItem._id);

        res.status(201).json({
            _id: cartItem._id.toString(),
            item: cartItem.item || null,
            quantity: cartItem.quantity,
        });
    } catch (err) {
        console.error("Error in addToCart:", err);
        res.status(500).json({ message: "Failed to add item to cart" });
    }
});

// PUT /api/cart/:id
export const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    console.log("PUT /api/cart/:id called by user:", req.user?._id, "id:", req.params.id, "quantity:", quantity);

    if (!req.user?._id) return res.status(400).json({ message: "User not authenticated" });

    try {
        const cartItem = await CartItem.findOne({ _id: req.params.id, user: req.user._id });
        if (!cartItem) {
            res.status(404);
            throw new Error('Cart item not found');
        }

        cartItem.quantity = Math.max(1, quantity);
        await cartItem.save();
        await cartItem.populate('item');

        res.json({
            _id: cartItem._id.toString(),
            item: cartItem.item || null,
            quantity: cartItem.quantity,
        });
    } catch (err) {
        console.error("Error in updateCartItem:", err);
        res.status(500).json({ message: "Failed to update cart item" });
    }
});

// DELETE /api/cart/:id
export const deleteCartItem = asyncHandler(async (req, res) => {
    console.log("DELETE /api/cart/:id called by user:", req.user?._id, "id:", req.params.id);

    if (!req.user?._id) return res.status(400).json({ message: "User not authenticated" });

    try {
        const cartItem = await CartItem.findOne({ _id: req.params.id, user: req.user._id });
        if (!cartItem) {
            res.status(404);
            throw new Error('Cart item not found');
        }

        await cartItem.deleteOne();
        console.log("Cart item deleted:", cartItem._id);
        res.json({ _id: req.params.id });
    } catch (err) {
        console.error("Error in deleteCartItem:", err);
        res.status(500).json({ message: "Failed to delete cart item" });
    }
});

// POST /api/cart/clear
export const clearCart = asyncHandler(async (req, res) => {
    console.log("POST /api/cart/clear called by user:", req.user?._id);

    if (!req.user?._id) return res.status(400).json({ message: "User not authenticated" });

    try {
        await CartItem.deleteMany({ user: req.user._id });
        console.log("Cart cleared for user:", req.user._id);
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        console.error("Error in clearCart:", err);
        res.status(500).json({ message: "Failed to clear cart" });
    }
});
