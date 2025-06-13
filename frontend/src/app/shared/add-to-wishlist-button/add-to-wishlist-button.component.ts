import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-add-to-wishlist-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-to-wishlist-button.component.html',
  styleUrls: ['./add-to-wishlist-button.component.css']
})
export class AddToWishlistButtonComponent implements OnInit {
  @Input() product!: Product;
  @Input() buttonText = '';
  @Input() buttonClass = 'btn-outline-danger';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() showText = false;
  @Input() iconOnly = true;

  @Output() added = new EventEmitter<Product>();
  @Output() removed = new EventEmitter<Product>();
  @Output() toggled = new EventEmitter<{ product: Product, inWishlist: boolean }>();

  isLoading = false;
  isAuthenticated = false;
  isInWishlist = false;

  constructor(
    private wishlistService: WishlistService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      this.checkIfInWishlist();
    });

    this.wishlistService.wishlist$.subscribe(() => {
      this.checkIfInWishlist();
    });

    // Initial check
    this.checkIfInWishlist();
  }

  checkIfInWishlist() {
    if (this.product && this.product._id) {
      this.isInWishlist = this.wishlistService.isInWishlist(this.product._id);
    }
  }

  toggleWishlist() {
    if (this.disabled || this.isLoading) {
      return;
    }

    this.isLoading = true;

    if (this.isInWishlist) {
      // Remove from wishlist
      this.wishlistService.removeFromWishlist(this.product._id).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess(
              `${this.product.name} removed from wishlist!`
            );
            this.removed.emit(this.product);
            this.toggled.emit({ product: this.product, inWishlist: false });
            this.checkIfInWishlist();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
          const errorMessage = error.error?.message || 'Failed to remove product from wishlist';
          this.notificationService.showError(errorMessage);
          this.isLoading = false;
        }
      });
    } else {
      // Add to wishlist
      this.wishlistService.addToWishlist(this.product).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess(
              `${this.product.name} added to wishlist!`
            );
            this.added.emit(this.product);
            this.toggled.emit({ product: this.product, inWishlist: true });
            this.checkIfInWishlist();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
          const errorMessage = error.error?.message || 'Failed to add product to wishlist';
          this.notificationService.showError(errorMessage);
          this.isLoading = false;
        }
      });
    }
  }

  get buttonSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'btn-sm';
      case 'lg': return 'btn-lg';
      default: return '';
    }
  }

  get displayText(): string {
    if (this.isLoading) {
      return this.isInWishlist ? 'Removing...' : 'Adding...';
    }
    
    if (this.buttonText) {
      return this.buttonText;
    }
    
    return this.isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';
  }

  get heartIcon(): string {
    if (this.isLoading) {
      return 'bi-heart'; // Show outline during loading
    }
    return this.isInWishlist ? 'bi-heart-fill' : 'bi-heart';
  }

  get buttonClasses(): string {
    const classes = ['btn', this.buttonSizeClass];
    
    if (this.isInWishlist) {
      classes.push('btn-danger'); // Filled heart - danger color
    } else {
      classes.push(this.buttonClass); // Outline heart - custom or default
    }
    
    if (this.isLoading) {
      classes.push('loading');
    }
    
    if (this.iconOnly && !this.showText) {
      classes.push('btn-icon-only');
    }
    
    return classes.filter(c => c).join(' ');
  }

  get tooltipText(): string {
    if (this.isLoading) {
      return this.isInWishlist ? 'Removing from wishlist...' : 'Adding to wishlist...';
    }
    
    if (!this.isAuthenticated) {
      return 'Sign in to save items to your wishlist';
    }
    
    return this.isInWishlist 
      ? `Remove ${this.product.name} from wishlist`
      : `Add ${this.product.name} to wishlist`;
  }

  get guestNoticeText(): string {
    return this.isInWishlist 
      ? 'Saved to wishlist - will sync when you log in'
      : 'Save to wishlist - will sync when you log in';
  }
}