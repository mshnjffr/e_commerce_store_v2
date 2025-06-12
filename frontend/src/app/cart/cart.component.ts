import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { Cart, CartItem } from '../models/cart.model';
import { CartItemComponent } from '../shared/cart-item/cart-item.component';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, CartItemComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  isLoading = false;
  isAuthenticated = false;
  guestCartItemCount = 0;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  // Helper methods for template
  getValidItems(): any[] {
    return this.cart?.items.filter(item => 
      item.productId && typeof item.productId === 'object' && item.productId._id
    ) || [];
  }

  getItemCount(): number {
    return this.getValidItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.getValidItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getShippingCost(): number {
    const subtotal = this.getSubtotal();
    return subtotal > 50 ? 0 : 10; // Free shipping over $50
  }

  getTax(): number {
    return this.getSubtotal() * 0.08; // 8% tax
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost() + this.getTax();
  }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.loadCart();
      } else {
        this.loadGuestCart();
      }
    });
  }

  loadCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cart = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.isLoading = false;
      }
    });
  }



  loadGuestCart() {
    this.guestCartItemCount = this.cartService.getGuestCartCount();
    this.cart = null;
  }

  onQuantityChange(event: { productId: string, quantity: number }) {
    this.cartService.updateCartItem(event.productId, { quantity: event.quantity }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cart = response.data;
          this.notificationService.showSuccess('Cart updated');
        }
      },
      error: (error) => {
        console.error('Error updating cart:', error);
        this.notificationService.showError('Failed to update cart');
      }
    });
  }

  onRemoveItem(productId: string) {
    this.cartService.removeFromCart(productId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cart = response.data;
          this.notificationService.showSuccess('Item removed from cart');
        }
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.notificationService.showError('Failed to remove item');
      }
    });
  }

  onViewProduct(productId: string) {
    // Navigation handled by RouterLink in the component
  }

  clearCart() {
    this.cartService.clearCart().subscribe({
      next: (response) => {
        if (response.success) {
          this.cart = null;
          this.notificationService.showSuccess('Cart cleared');
        }
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
      }
    });
  }

  trackByProductId(index: number, item: CartItem): string {
    return item.productId?._id || `item-${index}`;
  }
}
