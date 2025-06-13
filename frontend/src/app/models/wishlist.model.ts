export interface Wishlist {
  _id: string;
  userId: string;
  items: WishlistItem[];
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    isActive: boolean;
  };
  addedAt: Date;
  notes?: string;
}

export interface AddToWishlistRequest {
  productId: string;
  notes?: string;
}

export interface UpdateWishlistItemRequest {
  notes?: string;
}

export interface WishlistSummary {
  itemCount: number;
  hasItems: boolean;
}