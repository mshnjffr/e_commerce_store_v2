import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { AuthRequest, ApiResponse } from '../types';
import { createError, asyncHandler } from '../middleware/errorHandler';

export const getCategories = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const includeInactive = req.query.includeInactive === 'true';
  const query = includeInactive ? {} : { isActive: true };

  const categories = await Category.find(query)
    .populate('parentCategory', 'name')
    .sort({ name: 1 });

  res.json({
    success: true,
    message: 'Categories retrieved successfully',
    data: { categories }
  });
});

export const getCategory = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { id } = req.params;

  const category = await Category.findById(id)
    .populate('parentCategory', 'name');

  if (!category) {
    throw createError('Category not found', 404);
  }

  // Get subcategories
  const subcategories = await Category.find({ parentCategory: id, isActive: true });

  // Get product count
  const productCount = await Product.countDocuments({ categoryId: id, isActive: true });

  res.json({
    success: true,
    message: 'Category retrieved successfully',
    data: {
      category,
      subcategories,
      productCount
    }
  });
});

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { name, description, image, parentCategory } = req.body;

  // Check if parent category exists if provided
  if (parentCategory) {
    const parentExists = await Category.findById(parentCategory);
    if (!parentExists) {
      throw createError('Parent category not found', 404);
    }
  }

  const category = new Category({
    name,
    description,
    image,
    parentCategory: parentCategory || null
  });

  await category.save();
  await category.populate('parentCategory', 'name');

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category }
  });
});

export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { id } = req.params;
  const updates = req.body;

  // Check if parent category exists if being updated
  if (updates.parentCategory) {
    const parentExists = await Category.findById(updates.parentCategory);
    if (!parentExists) {
      throw createError('Parent category not found', 404);
    }

    // Prevent setting self as parent
    if (updates.parentCategory === id) {
      throw createError('Category cannot be its own parent', 400);
    }
  }

  const category = await Category.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  ).populate('parentCategory', 'name');

  if (!category) {
    throw createError('Category not found', 404);
  }

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: { category }
  });
});

export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { id } = req.params;

  // Check if category has products
  const productCount = await Product.countDocuments({ categoryId: id });
  if (productCount > 0) {
    throw createError('Cannot delete category with existing products', 400);
  }

  // Check if category has subcategories
  const subcategoryCount = await Category.countDocuments({ parentCategory: id });
  if (subcategoryCount > 0) {
    throw createError('Cannot delete category with subcategories', 400);
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw createError('Category not found', 404);
  }

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

export const getCategoryHierarchy = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  // Get all root categories (no parent)
  const rootCategories = await Category.find({ parentCategory: null, isActive: true })
    .sort({ name: 1 });

  const buildHierarchy = async (categories: any[]): Promise<any[]> => {
    const hierarchy: any[] = [];
    for (const category of categories) {
      const subcategories = await Category.find({ 
        parentCategory: category._id, 
        isActive: true 
      }).sort({ name: 1 });

      const categoryWithChildren: any = {
        ...category.toObject(),
        children: subcategories.length > 0 ? await buildHierarchy(subcategories) : []
      };

      hierarchy.push(categoryWithChildren);
    }
    return hierarchy;
  };

  const hierarchy = await buildHierarchy(rootCategories);

  res.json({
    success: true,
    message: 'Category hierarchy retrieved successfully',
    data: { categories: hierarchy }
  });
});

export const getCategoriesWithProductCount = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const categories = await Category.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'categoryId',
        as: 'products'
      }
    },
    {
      $addFields: {
        productCount: {
          $size: {
            $filter: {
              input: '$products',
              cond: { $eq: ['$$this.isActive', true] }
            }
          }
        }
      }
    },
    {
      $project: {
        products: 0
      }
    },
    { $sort: { name: 1 } }
  ]);

  res.json({
    success: true,
    message: 'Categories with product count retrieved successfully',
    data: { categories }
  });
});
