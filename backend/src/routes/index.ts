import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import orderRoutes from './orderRoutes';
import categoryRoutes from './categoryRoutes';

const router = Router();

// API version prefix
const API_VERSION = '/api/v1';

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce API is running',
    data: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// Route mappings
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/products`, productRoutes);
router.use(`${API_VERSION}/cart`, cartRoutes);
router.use(`${API_VERSION}/orders`, orderRoutes);
router.use(`${API_VERSION}/categories`, categoryRoutes);

export default router;
