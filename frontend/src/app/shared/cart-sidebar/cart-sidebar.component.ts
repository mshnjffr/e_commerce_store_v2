import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Cart, CartItem, CartSummary } from '../../models/cart.model';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.css']
})
export class CartSidebarComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeCart = new EventEmitter<void>();
  @Output() cartChanged = new EventEmitter<void>();

  cart: Cart | null = null;
  cartSummary: CartSummary = { itemCount: 0, totalAmount: 0 };
  isAuthenticated = false;
  isLoading = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.loadCart();
      }
    });

    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });

    this.cartService.cartSummary$.subscribe(summary => {
      this.cartSummary = summary;
    });
  }

  loadCart() {
    if (this.isAuthenticated) {
      this.isLoading = true;
      this.cartService.getCart().subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading cart:', error);
          this.isLoading = false;
        }
      });
    }
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;
    
    this.cartService.updateCartItem(productId, { quantity }).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Cart updated');
          this.cartChanged.emit();
        }
      },
      error: (error) => {
        console.error('Error updating cart:', error);
        this.notificationService.showError('Failed to update cart');
      }
    });
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Item removed from cart');
          this.cartChanged.emit();
        }
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.notificationService.showError('Failed to remove item');
      }
    });
  }

  getItemCount(): number {
    return this.cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  getSubtotal(): number {
    return this.cart?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
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

  closeSidebar() {
    this.closeCart.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeSidebar();
    }
  }

  trackByProductId(index: number, item: CartItem): string {
    return item.productId?._id || item.productId || `${index}`;
  }
}
