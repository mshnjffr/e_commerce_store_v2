import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest, ApiResponse, LoginRequest, RegisterRequest, JwtPayload } from '../types';
import { createError, asyncHandler } from '../middleware/errorHandler';

const generateToken = (userId: string, email: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw createError('JWT secret not configured', 500);
  }

  const payload: JwtPayload = { userId, email, role };
  return jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  } as jwt.SignOptions);
};

export const register = asyncHandler(async (req: Request<{}, ApiResponse, RegisterRequest>, res: Response<ApiResponse>) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError('User already exists with this email', 400);
  }

  // Create new user
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    phone
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id.toString(), user.email, user.role);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    }
  });
});

export const login = asyncHandler(async (req: Request<{}, ApiResponse, LoginRequest>, res: Response<ApiResponse>) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw createError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw createError('Account is deactivated', 401);
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createError('Invalid credentials', 401);
  }

  // Generate token
  const token = generateToken(user._id.toString(), user.email, user.role);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address
      },
      token
    }
  });
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    }
  });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const allowedUpdates = ['firstName', 'lastName', 'phone', 'address'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw createError('Invalid updates. Only firstName, lastName, phone, and address can be updated', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createError('Current password and new password are required', 400);
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw createError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw createError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  // Soft delete by deactivating account
  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});
