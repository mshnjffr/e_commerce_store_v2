import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryHierarchy,
  getCategoriesWithProductCount
} from '../controllers/CategoryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/hierarchy', getCategoryHierarchy);
router.get('/with-count', getCategoriesWithProductCount);
router.get('/:id', getCategory);

// Admin routes
router.post('/', authenticate, authorize('admin'), createCategory);
router.put('/:id', authenticate, authorize('admin'), updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

export default router;
