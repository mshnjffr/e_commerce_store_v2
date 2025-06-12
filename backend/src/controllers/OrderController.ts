import { Response } from 'express';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { AuthRequest, ApiResponse } from '../types';
import { createError, asyncHandler } from '../middleware/errorHandler';

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { shippingAddress, billingAddress, paymentMethod, notes } = req.body;

  // Use defaults if not provided for simplified checkout
  const defaultShippingAddress = {
    street: 'Demo Address',
    city: 'Demo City',
    state: 'Demo State', 
    zipCode: '12345',
    country: 'USA'
  };

  const finalShippingAddress = shippingAddress || defaultShippingAddress;
  const finalPaymentMethod = paymentMethod || 'cash_on_delivery';

  // Get user's cart
  const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
  if (!cart || cart.items.length === 0) {
    throw createError('Cart is empty', 400);
  }

  // Validate stock availability and prepare order items
  const orderItems = [];
  let totalAmount = 0;

  for (const cartItem of cart.items) {
    const product = cartItem.productId as any;
    
    if (!product || !product.isActive) {
      throw createError(`Product ${product?.name || 'unknown'} is no longer available`, 400);
    }

    if (product.stock < cartItem.quantity) {
      throw createError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400);
    }

    const itemTotal = product.price * cartItem.quantity;
    orderItems.push({
      productId: product._id,
      productName: product.name,
      quantity: cartItem.quantity,
      price: product.price,
      totalPrice: itemTotal
    });

    totalAmount += itemTotal;
  }

  // Create order
  const order = new Order({
    userId: req.user._id,
    items: orderItems,
    totalAmount,
    paymentMethod: finalPaymentMethod,
    shippingAddress: finalShippingAddress,
    billingAddress: billingAddress || finalShippingAddress,
    notes
  });

  await order.save();

  // Update product stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: -item.quantity } }
    );
  }

  // Clear cart
  cart.items = [];
  await cart.save();

  await order.populate('items.productId', 'name images');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order }
  });
});

export const getOrders = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const query: any = { userId: req.user._id };
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate('items.productId', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    message: 'Orders retrieved successfully',
    data: {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    }
  });
});

export const getOrder = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { id } = req.params;

  const order = await Order.findOne({ _id: id, userId: req.user._id })
    .populate('items.productId', 'name images');

  if (!order) {
    throw createError('Order not found', 404);
  }

  res.json({
    success: true,
    message: 'Order retrieved successfully',
    data: { order }
  });
});

export const cancelOrder = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { id } = req.params;

  const order = await Order.findOne({ _id: id, userId: req.user._id });
  if (!order) {
    throw createError('Order not found', 404);
  }

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    throw createError('Order cannot be cancelled at this stage', 400);
  }

  // Update order status
  order.status = 'cancelled';
  await order.save();

  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: item.quantity } }
    );
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order }
  });
});

// Admin routes
export const getAllOrders = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate('userId', 'firstName lastName email')
    .populate('items.productId', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    message: 'All orders retrieved successfully',
    data: {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    }
  });
});

export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

  if (status && !validStatuses.includes(status)) {
    throw createError('Invalid order status', 400);
  }

  if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
    throw createError('Invalid payment status', 400);
  }

  const updateData: any = {};
  if (status) updateData.status = status;
  if (paymentStatus) updateData.paymentStatus = paymentStatus;

  const order = await Order.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('userId', 'firstName lastName email')
   .populate('items.productId', 'name images');

  if (!order) {
    throw createError('Order not found', 404);
  }

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: { order }
  });
});

export const getOrderStats = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  res.json({
    success: true,
    message: 'Order statistics retrieved successfully',
    data: {
      statusStats: stats,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    }
  });
});
