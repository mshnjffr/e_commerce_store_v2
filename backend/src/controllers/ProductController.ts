import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { AuthRequest, ApiResponse } from '../types';
import { createError, asyncHandler } from '../middleware/errorHandler';

export const getProducts = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortBy = req.query.sortBy as string || 'createdAt';
  const sortOrder = req.query.sortOrder as string || 'desc';
  const category = req.query.category as string;
  const search = req.query.search as string;
  const minPrice = parseFloat(req.query.minPrice as string);
  const maxPrice = parseFloat(req.query.maxPrice as string);

  const skip = (page - 1) * limit;

  // Build query
  const query: any = { isActive: true };

  if (category) {
    // If it looks like an ObjectId, filter by categoryId, otherwise by category name
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.categoryId = category;
    } else {
      query.category = new RegExp(category, 'i');
    }
  }

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
  }

  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    query.price = {};
    if (!isNaN(minPrice)) query.price.$gte = minPrice;
    if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
  }

  // Execute query
  const products = await Product.find(query)
    .populate('categoryId', 'name')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);

  res.json({
    success: true,
    message: 'Products retrieved successfully',
    data: {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    }
  });
});

export const getProduct = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { id } = req.params;

  const product = await Product.findOne({ _id: id, isActive: true })
    .populate('categoryId', 'name')
    .populate('ratings.userId', 'firstName lastName');

  if (!product) {
    throw createError('Product not found', 404);
  }

  res.json({
    success: true,
    message: 'Product retrieved successfully',
    data: { product }
  });
});

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { name, description, price, category, categoryId, images, stock, sku } = req.body;

  // Verify category exists
  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    throw createError('Category not found', 404);
  }

  const product = new Product({
    name,
    description,
    price,
    category: categoryExists.name,
    categoryId,
    images: images || [],
    stock,
    sku
  });

  await product.save();
  await product.populate('categoryId', 'name');

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { id } = req.params;
  const updates = req.body;

  // If categoryId is being updated, verify it exists
  if (updates.categoryId) {
    const categoryExists = await Category.findById(updates.categoryId);
    if (!categoryExists) {
      throw createError('Category not found', 404);
    }
    updates.category = categoryExists.name;
  }

  const product = await Product.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  ).populate('categoryId', 'name');

  if (!product) {
    throw createError('Product not found', 404);
  }

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { id } = req.params;

  // Soft delete
  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    throw createError('Product not found', 404);
  }

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

export const addProductRating = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw createError('Rating must be between 1 and 5', 400);
  }

  const product = await Product.findById(id);
  if (!product) {
    throw createError('Product not found', 404);
  }

  // Check if user already rated this product
  const existingRatingIndex = product.ratings.findIndex(
    r => r.userId.toString() === req.user!._id.toString()
  );

  if (existingRatingIndex !== -1) {
    // Update existing rating
    product.ratings[existingRatingIndex].rating = rating;
    product.ratings[existingRatingIndex].comment = comment;
  } else {
    // Add new rating
    product.ratings.push({
      userId: req.user._id,
      rating,
      comment,
      createdAt: new Date()
    });
  }

  await product.save();
  await product.populate('ratings.userId', 'firstName lastName');

  res.json({
    success: true,
    message: 'Rating added successfully',
    data: { product }
  });
});

export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const limit = parseInt(req.query.limit as string) || 8;

  const products = await Product.find({ isActive: true })
    .populate('categoryId', 'name')
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(limit);

  res.json({
    success: true,
    message: 'Featured products retrieved successfully',
    data: { products }
  });
});

export const getProductsByCategory = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { categoryId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const products = await Product.find({ categoryId, isActive: true })
    .populate('categoryId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments({ categoryId, isActive: true });

  res.json({
    success: true,
    message: 'Products retrieved successfully',
    data: {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    }
  });
});
