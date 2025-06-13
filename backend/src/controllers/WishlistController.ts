import { Response } from 'express';
import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
import { AuthRequest, ApiResponse } from '../types';
import { createError, asyncHandler } from '../middleware/errorHandler';

export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  let wishlist = await Wishlist.findOne({ userId: req.user._id })
    .populate('items.productId', 'name price images stock isActive averageRating category');

  if (!wishlist) {
    wishlist = new Wishlist({ userId: req.user._id, items: [] });
    await wishlist.save();
  }

  // Filter out inactive products
  wishlist.items = wishlist.items.filter(item => {
    const product = item.productId as any;
    return product && product.isActive;
  });

  await wishlist.save();

  res.json({
    success: true,
    message: 'Wishlist retrieved successfully',
    data: wishlist
  });
});

export const addToWishlist = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { productId, notes } = req.body;

  if (!productId) {
    throw createError('Product ID is required', 400);
  }

  // Check if product exists and is active
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw createError('Product not found or inactive', 404);
  }

  // Find or create wishlist
  let wishlist = await Wishlist.findOne({ userId: req.user._id });
  if (!wishlist) {
    wishlist = new Wishlist({ userId: req.user._id, items: [] });
  }

  // Check if product already in wishlist
  const existingItem = wishlist.items.find(
    item => item.productId.toString() === productId
  );

  if (existingItem) {
    throw createError('Product already in wishlist', 400);
  }

  // Add new item
  wishlist.items.push({
    productId,
    addedAt: new Date(),
    notes: notes || undefined
  });

  await wishlist.save();
  await wishlist.populate('items.productId', 'name price images stock isActive averageRating category');

  res.json({
    success: true,
    message: 'Product added to wishlist successfully',
    data: wishlist
  });
});

export const updateWishlistItem = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { productId } = req.params;
  const { notes } = req.body;

  // Check if product exists and is active
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw createError('Product not found or inactive', 404);
  }

  const wishlist = await Wishlist.findOne({ userId: req.user._id });
  if (!wishlist) {
    throw createError('Wishlist not found', 404);
  }

  const itemIndex = wishlist.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw createError('Product not found in wishlist', 404);
  }

  // Update item notes
  wishlist.items[itemIndex].notes = notes;

  await wishlist.save();
  await wishlist.populate('items.productId', 'name price images stock isActive averageRating category');

  res.json({
    success: true,
    message: 'Wishlist item updated successfully',
    data: wishlist
  });
});

export const removeFromWishlist = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ userId: req.user._id });
  if (!wishlist) {
    throw createError('Wishlist not found', 404);
  }

  const itemIndex = wishlist.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw createError('Product not found in wishlist', 404);
  }

  // Remove item using splice to avoid TypeScript errors
  wishlist.items.splice(itemIndex, 1);

  await wishlist.save();
  await wishlist.populate('items.productId', 'name price images stock isActive averageRating category');

  res.json({
    success: true,
    message: 'Product removed from wishlist successfully',
    data: wishlist
  });
});

export const clearWishlist = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const wishlist = await Wishlist.findOne({ userId: req.user._id });
  if (!wishlist) {
    throw createError('Wishlist not found', 404);
  }

  wishlist.items = [];
  await wishlist.save();

  res.json({
    success: true,
    message: 'Wishlist cleared successfully',
    data: wishlist
  });
});

export const getWishlistItemCount = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const wishlist = await Wishlist.findOne({ userId: req.user._id });
  const itemCount = wishlist ? wishlist.items.length : 0;

  res.json({
    success: true,
    message: 'Wishlist item count retrieved successfully',
    data: { count: itemCount }
  });
});

export const moveToCart = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  // Check if product exists and is active
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw createError('Product not found or inactive', 404);
  }

  // Check if enough stock available
  if (product.stock < quantity) {
    throw createError(`Only ${product.stock} items available in stock`, 400);
  }

  const wishlist = await Wishlist.findOne({ userId: req.user._id });
  if (!wishlist) {
    throw createError('Wishlist not found', 404);
  }

  const itemIndex = wishlist.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw createError('Product not found in wishlist', 404);
  }

  // Import Cart model dynamically to avoid circular dependencies
  const { Cart } = await import('../models/Cart');

  // Find or create cart
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    cart = new Cart({ userId: req.user._id, items: [] });
  }

  // Check if product already in cart
  const existingCartItemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (existingCartItemIndex !== -1) {
    // Update existing cart item
    const newQuantity = cart.items[existingCartItemIndex].quantity + quantity;
    
    if (product.stock < newQuantity) {
      throw createError(`Only ${product.stock} items available in stock`, 400);
    }

    cart.items[existingCartItemIndex].quantity = newQuantity;
    cart.items[existingCartItemIndex].price = product.price;
  } else {
    // Add new item to cart
    cart.items.push({
      productId,
      quantity,
      price: product.price,
      totalPrice: 0 // Will be calculated in pre-save hook
    });
  }

  // Remove from wishlist
  wishlist.items.splice(itemIndex, 1);

  // Save both cart and wishlist
  await Promise.all([cart.save(), wishlist.save()]);

  // Populate wishlist for response
  await wishlist.populate('items.productId', 'name price images stock isActive averageRating category');

  res.json({
    success: true,
    message: 'Product moved to cart successfully',
    data: wishlist
  });
});