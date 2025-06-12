import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-add-to-cart-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-to-cart-button.component.html',
  styleUrls: ['./add-to-cart-button.component.css']
})
export class AddToCartButtonComponent implements OnInit {
  @Input() product!: Product;
  @Input() quantity = 1;
  @Input() showQuantitySelector = false;
  @Input() buttonText = 'Add to Cart';
  @Input() buttonClass = 'btn-primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() showStockInfo = true;

  @Output() added = new EventEmitter<{ product: Product, quantity: number }>();
  @Output() quantityChange = new EventEmitter<number>();

  isLoading = false;
  isAuthenticated = false;
  isInCart = false;
  cartQuantity = 0;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      this.checkIfInCart();
    });

    this.cartService.cart$.subscribe(() => {
      this.checkIfInCart();
    });
  }

  checkIfInCart() {
    if (this.isAuthenticated && this.cartService.currentCart) {
      const cartItem = this.cartService.currentCart.items.find(
        item => item.productId && item.productId._id === this.product._id
      );
      this.isInCart = !!cartItem;
      this.cartQuantity = cartItem?.quantity || 0;
    } else {
      this.isInCart = false;
      this.cartQuantity = 0;
    }
  }

  addToCart() {
    if (this.disabled || this.isLoading || !this.canAddToCart) {
      return;
    }

    this.isLoading = true;

    this.cartService.addToCartSmart({
      productId: this.product._id,
      quantity: this.quantity
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess(
            `${this.product.name} added to cart!`
          );
          this.added.emit({ product: this.product, quantity: this.quantity });
          this.checkIfInCart();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        const errorMessage = error.error?.message || 'Failed to add product to cart';
        this.notificationService.showError(errorMessage);
        this.isLoading = false;
      }
    });
  }

  updateQuantity(newQuantity: number) {
    if (newQuantity >= 1 && newQuantity <= this.product.stock) {
      this.quantity = newQuantity;
      this.quantityChange.emit(this.quantity);
    }
  }

  increaseQuantity() {
    if (this.quantity < this.product.stock) {
      this.updateQuantity(this.quantity + 1);
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.updateQuantity(this.quantity - 1);
    }
  }

  get canAddToCart(): boolean {
    return this.product.stock > 0 && 
           this.quantity > 0 && 
           this.quantity <= this.product.stock &&
           !this.disabled;
  }

  get buttonSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'btn-sm';
      case 'lg': return 'btn-lg';
      default: return '';
    }
  }

  get stockStatus(): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (this.product.stock <= 0) return 'out-of-stock';
    if (this.product.stock <= 10) return 'low-stock';
    return 'in-stock';
  }

  get stockText(): string {
    switch (this.stockStatus) {
      case 'out-of-stock':
        return 'Out of Stock';
      case 'low-stock':
        return `Only ${this.product.stock} left`;
      default:
        return `${this.product.stock} in stock`;
    }
  }

  get stockClass(): string {
    switch (this.stockStatus) {
      case 'out-of-stock':
        return 'text-danger';
      case 'low-stock':
        return 'text-warning';
      default:
        return 'text-success';
    }
  }

  get displayText(): string {
    if (this.isLoading) return 'Adding...';
    if (this.stockStatus === 'out-of-stock') return 'Out of Stock';
    if (this.isInCart && this.isAuthenticated) return `In Cart (${this.cartQuantity})`;
    return this.buttonText;
  }

  get buttonClasses(): string {
    const classes = ['btn', this.buttonClass, this.buttonSizeClass];
    
    if (this.isLoading) classes.push('loading');
    if (this.stockStatus === 'out-of-stock') classes.push('btn-secondary');
    if (this.isInCart && this.isAuthenticated) classes.push('btn-success');
    
    return classes.filter(c => c).join(' ');
  }
}
