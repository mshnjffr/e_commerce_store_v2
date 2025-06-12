import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { NotificationService } from '../services/notification.service';
import { Product, ProductReview, AddReviewRequest } from '../models/product.model';
import { ProductRatingComponent } from '../shared/product-rating/product-rating.component';
import { ProductGridComponent } from '../shared/product-grid/product-grid.component';
import { ImageGalleryComponent } from '../shared/image-gallery/image-gallery.component';
import { AddToCartButtonComponent } from '../shared/add-to-cart-button/add-to-cart-button.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductRatingComponent, ProductGridComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  isLoading = false;
  isLoadingRelated = false;
  quantity = 1;
  selectedImageIndex = 0;
  
  // Image zoom
  @ViewChild('zoomImage') zoomImage!: ElementRef;
  isZooming = false;
  zoomStyle = {};

  // Tabs
  activeTab = 'description';
  
  // Reviews
  isAddingReview = false;
  newReview: AddReviewRequest = {
    rating: 5,
    comment: ''
  };
  
  // Specifications (mock data - would come from API)
  specifications = [
    { label: 'Brand', value: 'Example Brand' },
    { label: 'Model', value: 'Example Model' },
    { label: 'Weight', value: '1.2 kg' },
    { label: 'Dimensions', value: '10 x 8 x 2 inches' },
    { label: 'Material', value: 'Premium Quality' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.productService.getProduct(id).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.product) {
          this.product = response.data.product;
          this.loadRelatedProducts();
        } else {
          this.notificationService.showError('Product not found');
          this.router.navigate(['/']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.notificationService.showError('Error loading product');
        this.router.navigate(['/']);
        this.isLoading = false;
      }
    });
  }

  loadRelatedProducts() {
    if (!this.product?.categoryId) return;
    
    this.isLoadingRelated = true;
    // Handle categoryId as either string or populated object
    const categoryId = typeof this.product.categoryId === 'string' 
      ? this.product.categoryId 
      : (this.product.categoryId as any)._id;
    
    this.productService.getProductsByCategory(categoryId, { limit: 8 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filter out current product
          this.relatedProducts = (response.data.items || []).filter((p: Product) => p._id !== this.product?._id);
        }
        this.isLoadingRelated = false;
      },
      error: (error) => {
        console.error('Error loading related products:', error);
        this.isLoadingRelated = false;
      }
    });
  }

  addToCart() {
    if (!this.product || this.quantity <= 0) return;
    
    this.cartService.addToCartSmart({ 
      productId: this.product._id, 
      quantity: this.quantity 
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess(`${this.product!.name} added to cart!`);
        }
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.notificationService.showError('Failed to add product to cart');
      }
    });
  }

  buyNow() {
    if (!this.product || this.quantity <= 0) return;
    
    this.addToCart();
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 500);
  }

  // Image handling
  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  nextImage() {
    if (this.product && this.product.images.length > 1) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.product.images.length;
    }
  }

  previousImage() {
    if (this.product && this.product.images.length > 1) {
      this.selectedImageIndex = this.selectedImageIndex === 0 
        ? this.product.images.length - 1 
        : this.selectedImageIndex - 1;
    }
  }

  // Image zoom functionality
  onMouseEnterImage() {
    this.isZooming = true;
  }

  onMouseLeaveImage() {
    this.isZooming = false;
    this.zoomStyle = {};
  }

  onMouseMoveImage(event: MouseEvent) {
    if (!this.isZooming || !this.zoomImage) return;

    const rect = this.zoomImage.nativeElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.zoomStyle = {
      'transform-origin': `${x}% ${y}%`,
      'transform': 'scale(2)'
    };
  }

  // Quantity controls
  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  updateQuantity(value: number) {
    if (value >= 1 && this.product && value <= this.product.stock) {
      this.quantity = value;
    }
  }

  // Tab navigation
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // Review functionality
  submitReview() {
    if (!this.product || !this.newReview.comment.trim()) {
      this.notificationService.showError('Please fill in all fields');
      return;
    }

    this.isAddingReview = true;
    this.productService.addProductReview(this.product._id, this.newReview).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Review added successfully!');
          this.newReview = { rating: 5, comment: '' };
          // Reload product to get updated reviews
          this.loadProduct(this.product!._id);
        }
        this.isAddingReview = false;
      },
      error: (error) => {
        console.error('Error adding review:', error);
        this.notificationService.showError('Failed to add review');
        this.isAddingReview = false;
      }
    });
  }

  // Utility methods
  get stockStatus(): string {
    if (!this.product) return '';
    if (this.product.stock <= 0) return 'Out of Stock';
    if (this.product.stock <= 10) return `Only ${this.product.stock} left in stock`;
    return 'In Stock';
  }

  get stockClass(): string {
    if (!this.product) return '';
    if (this.product.stock <= 0) return 'text-danger';
    if (this.product.stock <= 10) return 'text-warning';
    return 'text-success';
  }

  get isOutOfStock(): boolean {
    return !this.product || this.product.stock <= 0;
  }

  get canAddToCart(): boolean {
    return !this.isOutOfStock && this.quantity > 0 && this.quantity <= (this.product?.stock || 0);
  }

  get averageRating(): number {
    return this.product?.rating?.average || 0;
  }

  get reviewCount(): number {
    return this.product?.rating?.count || 0;
  }

  getCategoryName(): string {
    if (!this.product) return '';
    
    // Try categoryId first (populated object)
    if (this.product.categoryId && typeof this.product.categoryId !== 'string') {
      return (this.product.categoryId as any).name;
    }
    
    // Fall back to category string if available
    if (this.product.category) {
      return typeof this.product.category === 'string' 
        ? this.product.category 
        : (this.product.category as any).name;
    }
    
    return '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  // Related products
  onAddToCartRelated(product: Product) {
    // Cart addition is handled by the add-to-cart-button component
    // This event handler is for any additional logic needed after adding to cart
    console.log(`${product.name} was added to cart via add-to-cart-button component`);
  }

  onAddToWishlistRelated(product: Product) {
    this.notificationService.showInfo(`${product.name} added to wishlist!`);
  }

  // Breadcrumb navigation
  goToCategory() {
    if (this.product?.categoryId) {
      const categoryId = typeof this.product.categoryId === 'string' 
        ? this.product.categoryId 
        : (this.product.categoryId as any)._id;
      this.router.navigate(['/category', categoryId]);
    }
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }
}
