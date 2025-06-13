import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { Wishlist, WishlistItem } from '../models/wishlist.model';
import { AddToCartButtonComponent } from '../shared/add-to-cart-button/add-to-cart-button.component';
import { AddToWishlistButtonComponent } from '../shared/add-to-wishlist-button/add-to-wishlist-button.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, AddToCartButtonComponent, AddToWishlistButtonComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  wishlist: Wishlist | null = null;
  isLoading = false;
  isAuthenticated = false;
  guestWishlistItemCount = 0;

  constructor(
    private wishlistService: WishlistService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.loadWishlist();
      } else {
        this.loadGuestWishlist();
      }
    });
  }

  loadWishlist() {
    this.isLoading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.wishlist = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
        this.isLoading = false;
        this.notificationService.showError('Failed to load wishlist');
      }
    });
  }

  loadGuestWishlist() {
    this.guestWishlistItemCount = this.wishlistService.getGuestWishlistCount();
    this.wishlist = null;
  }

  onRemoveFromWishlist(productId: string) {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.wishlist = response.data;
          this.notificationService.showSuccess('Item removed from wishlist');
        }
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.notificationService.showError('Failed to remove item from wishlist');
      }
    });
  }

  onAddToCart(event: { product: any, quantity: number }) {
    // The add-to-cart-button component handles the cart addition
    // We just need to show a success message
    this.notificationService.showSuccess(`${event.product.name} added to cart!`);
  }

  onViewProduct(productId: string) {
    // Navigation handled by RouterLink in the template
  }

  clearWishlist() {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      this.wishlistService.clearWishlist().subscribe({
        next: (response) => {
          if (response.success) {
            this.wishlist = null;
            this.notificationService.showSuccess('Wishlist cleared');
          }
        },
        error: (error) => {
          console.error('Error clearing wishlist:', error);
          this.notificationService.showError('Failed to clear wishlist');
        }
      });
    }
  }

  getValidItems(): WishlistItem[] {
    return this.wishlist?.items.filter(item => 
      item.productId && typeof item.productId === 'object' && item.productId._id
    ) || [];
  }

  getItemCount(): number {
    return this.getValidItems().length;
  }

  trackByProductId(index: number, item: WishlistItem): string {
    return item.productId?._id || `item-${index}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getProductImage(item: WishlistItem): string {
    return item.productId?.images?.[0] || '/assets/images/placeholder-product.jpg';
  }

  isProductInStock(item: WishlistItem): boolean {
    return item.productId?.stock > 0;
  }

  getStockStatus(item: WishlistItem): string {
    const stock = item.productId?.stock || 0;
    if (stock <= 0) return 'Out of Stock';
    if (stock <= 10) return `Only ${stock} left`;
    return 'In Stock';
  }

  getStockClass(item: WishlistItem): string {
    const stock = item.productId?.stock || 0;
    if (stock <= 0) return 'text-danger';
    if (stock <= 10) return 'text-warning';
    return 'text-success';
  }
}