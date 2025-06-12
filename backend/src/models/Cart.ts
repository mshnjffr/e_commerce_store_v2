import mongoose, { Schema } from 'mongoose';
import { ICart, ICartItem } from '../types';

const CartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  }
});

const CartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  items: [CartItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  }
}, {
  timestamps: true
});

// Index for user lookup
CartSchema.index({ userId: 1 });

// Calculate total amount before saving
CartSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total: number, item: any) => {
      item.totalPrice = item.price * item.quantity;
      return total + item.totalPrice;
    }, 0);
  } else {
    this.totalAmount = 0;
  }
  next();
});

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
