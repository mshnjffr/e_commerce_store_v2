import { Response } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { AuthRequest, ApiResponse } from '../types';
import { createError, asyncHandler } from '../middleware/errorHandler';

export const getCart = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  let cart = await Cart.findOne({ userId: req.user._id })
    .populate('items.productId', 'name price images stock isActive');

  if (!cart) {
    cart = new Cart({ userId: req.user._id, items: [] });
    await cart.save();
  }

  // Filter out inactive products
  cart.items = cart.items.filter(item => {
    const product = item.productId as any;
    return product && product.isActive;
  });

  await cart.save();

  res.json({
    success: true,
    message: 'Cart retrieved successfully',
    data: cart
  });
});

export const addToCart = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    throw createError('Product ID is required', 400);
  }

  if (quantity < 1) {
    throw createError('Quantity must be at least 1', 400);
  }

  // Check if product exists and is active
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw createError('Product not found or inactive', 404);
  }

  // Check if enough stock available
  if (product.stock < quantity) {
    throw createError(`Only ${product.stock} items available in stock`, 400);
  }

  // Find or create cart
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    cart = new Cart({ userId: req.user._id, items: [] });
  }

  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (existingItemIndex !== -1) {
    // Update existing item
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    
    if (product.stock < newQuantity) {
      throw createError(`Only ${product.stock} items available in stock`, 400);
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = product.price;
  } else {
    // Add new item
    cart.items.push({
      productId,
      quantity,
      price: product.price,
      totalPrice: 0 // Will be calculated in pre-save hook
    });
  }

  await cart.save();
  await cart.populate('items.productId', 'name price images stock isActive');

  res.json({
    success: true,
    message: 'Product added to cart successfully',
    data: cart
  });
});

export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    throw createError('Quantity must be at least 1', 400);
  }

  // Check if product exists and is active
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw createError('Product not found or inactive', 404);
  }

  // Check if enough stock available
  if (product.stock < quantity) {
    throw createError(`Only ${product.stock} items available in stock`, 400);
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    throw createError('Cart not found', 404);
  }

  const itemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw createError('Product not found in cart', 404);
  }

  // Update item
  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = product.price;

  await cart.save();
  await cart.populate('items.productId', 'name price images stock isActive');

  res.json({
    success: true,
    message: 'Cart item updated successfully',
    data: cart
  });
});

export const removeFromCart = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { productId } = req.params;

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    throw createError('Cart not found', 404);
  }

  const itemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw createError('Product not found in cart', 404);
  }

  // Remove item
  cart.items.splice(itemIndex, 1);

  await cart.save();
  await cart.populate('items.productId', 'name price images stock isActive');

  res.json({
    success: true,
    message: 'Product removed from cart successfully',
    data: cart
  });
});

export const clearCart = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    throw createError('Cart not found', 404);
  }

  cart.items = [];
  await cart.save();

  res.json({
    success: true,
    message: 'Cart cleared successfully',
    data: cart
  });
});

export const getCartItemCount = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  const itemCount = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

  res.json({
    success: true,
    message: 'Cart item count retrieved successfully',
    data: { count: itemCount }
  });
});
