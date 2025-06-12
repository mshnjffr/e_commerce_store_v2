import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductRatingComponent } from '../product-rating/product-rating.component';
import { AddToCartButtonComponent } from '../add-to-cart-button/add-to-cart-button.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductRatingComponent, AddToCartButtonComponent],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showAddToCart: boolean = true;
  @Input() showWishlist: boolean = true;
  @Input() layout: 'grid' | 'list' = 'grid';
  @Output() addToCart = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();

  currentImageIndex = 0;
  isImageLoading = true;
  imageError = false;

  get displayPrice(): string {
    return `$${this.product.price.toFixed(2)}`;
  }

  get stockStatus(): string {
    if (this.product.stock <= 0) return 'Out of Stock';
    if (this.product.stock <= 10) return `Only ${this.product.stock} left`;
    return 'In Stock';
  }

  get stockClass(): string {
    if (this.product.stock <= 0) return 'text-danger';
    if (this.product.stock <= 10) return 'text-warning';
    return 'text-success';
  }

  get isOutOfStock(): boolean {
    return this.product.stock <= 0;
  }

  get hasMultipleImages(): boolean {
    return this.product.images && this.product.images.length > 1;
  }

  onImageLoad() {
    this.isImageLoading = false;
  }

  onImageError() {
    this.isImageLoading = false;
    this.imageError = true;
  }

  nextImage() {
    if (this.hasMultipleImages) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images.length;
    }
  }

  previousImage() {
    if (this.hasMultipleImages) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.product.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  selectImage(index: number) {
    this.currentImageIndex = index;
  }

  onAddToCart() {
    if (!this.isOutOfStock) {
      this.addToCart.emit(this.product);
    }
  }

  onAddToWishlist() {
    this.addToWishlist.emit(this.product);
  }

  truncateText(text: string, limit: number): string {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  }
}
