import { Request } from 'express';
import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: IAddress;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Product Types
export interface IProduct extends Document {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: string;
  images: string[];
  stock: number;
  sku: string;
  isActive: boolean;
  ratings: IRating[];
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRating {
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Category Types
export interface ICategory extends Document {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface ICart extends Document {
  _id: string;
  userId: string;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartItem {
  productId: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

// Order Types
export interface IOrder extends Document {
  _id: string;
  userId: string;
  orderNumber: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: IAddress;
  billingAddress?: IAddress;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

// Request Types
export interface AuthRequest extends Request {
  user?: IUser;
}

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}
