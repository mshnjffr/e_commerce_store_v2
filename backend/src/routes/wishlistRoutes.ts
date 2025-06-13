import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  updateWishlistItem,
  removeFromWishlist,
  clearWishlist,
  getWishlistItemCount,
  moveToCart
} from '../controllers/WishlistController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

router.get('/', getWishlist);
router.get('/count', getWishlistItemCount);
router.post('/add', addToWishlist);
router.put('/item/:productId', updateWishlistItem);
router.delete('/item/:productId', removeFromWishlist);
router.delete('/clear', clearWishlist);
router.post('/move-to-cart/:productId', moveToCart);

export default router;