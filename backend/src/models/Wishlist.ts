import mongoose, { Schema } from 'mongoose';
import { IWishlist, IWishlistItem } from '../types';

const WishlistItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  addedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
});

const WishlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  items: [WishlistItemSchema],
  itemCount: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Item count cannot be negative']
  }
}, {
  timestamps: true
});

// Index for user lookup
WishlistSchema.index({ userId: 1 });

// Calculate item count before saving
WishlistSchema.pre('save', function(next) {
  if (this.items && this.items.length >= 0) {
    this.itemCount = this.items.length;
  } else {
    this.itemCount = 0;
  }
  next();
});

// Remove duplicate products using DocumentArray.splice() method
WishlistSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    const seenProducts = new Set<string>();
    
    // Iterate backwards to safely remove duplicates using splice
    for (let i = this.items.length - 1; i >= 0; i--) {
      const productId = this.items[i].productId.toString();
      
      if (seenProducts.has(productId)) {
        // Remove duplicate using DocumentArray.splice()
        this.items.splice(i, 1);
      } else {
        seenProducts.add(productId);
      }
    }
  }
  next();
});

export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);