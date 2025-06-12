export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string | Category;
  category?: Category;
  images: string[];
  stock: number;
  sku: string;
  featured?: boolean;
  rating?: {
    average: number;
    count: number;
  };
  reviews?: ProductReview[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductReview {
  _id: string;
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AddReviewRequest {
  rating: number;
  comment: string;
}
