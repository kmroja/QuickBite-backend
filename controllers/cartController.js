import asyncHandler from 'express-async-handler';
import { CartItem } from '../modals/cartItem.js';

// ----------------------------
// GET /api/cart
// ----------------------------
export const getCart = asyncHandler(async (req, res) => {
  const items = await CartItem.find({ user: req.user._id })
    .populate('item');

  res.json(
    items.map(ci => ({
      _id: ci._id,
      item: ci.item,
      quantity: ci.quantity,
    }))
  );
});


// ----------------------------
// POST /api/cart
// ----------------------------
export const addToCart = asyncHandler(async (req, res) => {
  const { itemId, quantity } = req.body;

  if (!itemId || typeof quantity !== 'number') {
    return res.status(400).json({
      message: 'itemId and quantity are required',
    });
  }

  let cartItem = await CartItem.findOne({
    user: req.user._id,
    item: itemId,
  });

  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({
      user: req.user._id,
      item: itemId,
      quantity,
    });
  }

  await cartItem.populate('item');

  res.status(200).json({
    _id: cartItem._id,
    item: cartItem.item,
    quantity: cartItem.quantity,
  });
});


// ----------------------------
// PUT /api/cart/:id
// ----------------------------
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  const cartItem = await CartItem.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!cartItem) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  cartItem.quantity = Math.max(1, quantity);
  await cartItem.save();
  await cartItem.populate('item');

  res.json({
    _id: cartItem._id,
    item: cartItem.item,
    quantity: cartItem.quantity,
  });
});


// ----------------------------
// DELETE /api/cart/:id
// ----------------------------
export const deleteCartItem = asyncHandler(async (req, res) => {
  await CartItem.deleteOne({
    _id: req.params.id,
    user: req.user._id,
  });

  res.json({ _id: req.params.id });
});


// ----------------------------
// POST /api/cart/clear
// ----------------------------
export const clearCart = asyncHandler(async (req, res) => {
  await CartItem.deleteMany({ user: req.user._id });
  res.json({ message: 'Cart cleared' });
});

