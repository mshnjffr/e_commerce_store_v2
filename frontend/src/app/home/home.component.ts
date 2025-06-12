import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { NotificationService } from '../services/notification.service';
import { Product, Category } from '../models/product.model';
import { ProductGridComponent } from '../shared/product-grid/product-grid.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductGridComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  isLoading = false;
  isCategoriesLoading = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.loadFeaturedProducts();
    this.loadCategories();
  }

  loadFeaturedProducts() {
    this.isLoading = true;
    this.productService.getFeaturedProducts(8).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.products) {
          this.featuredProducts = response.data.products;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        // Fallback to mock data for demo
        this.featuredProducts = this.getMockProducts();
        this.isLoading = false;
      }
    });
  }

  loadCategories() {
    this.isCategoriesLoading = true;
    this.productService.getCategoriesWithCount().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.categories) {
          this.categories = response.data.categories.slice(0, 6); // Show only first 6 categories
        }
        this.isCategoriesLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Fallback to mock data for demo
        this.categories = this.getMockCategories();
        this.isCategoriesLoading = false;
      }
    });
  }

  addToCart(product: Product) {
    // Cart addition is handled by the add-to-cart-button component
    // This event handler is for any additional logic needed after adding to cart
    console.log(`${product.name} was added to cart via add-to-cart-button component`);
  }

  onAddToWishlist(product: Product) {
    this.notificationService.showInfo(`${product.name} added to wishlist!`);
  }

  getMockProducts(): Product[] {
    return [
      {
        _id: '1',
        name: 'MacBook Pro M3',
        description: 'Powerful laptop for professionals',
        price: 2499.99,
        categoryId: 'cat1',
        images: ['https://via.placeholder.com/300x200'],
        stock: 10,
        sku: 'MBP-M3-001',
        rating: { average: 4.8, count: 120 },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        name: 'iPhone 15 Pro',
        description: 'Latest smartphone technology',
        price: 1199.99,
        categoryId: 'cat1',
        images: ['https://via.placeholder.com/300x200'],
        stock: 25,
        sku: 'IP15-PRO-001',
        rating: { average: 4.9, count: 89 },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '3',
        name: 'Nike Air Max',
        description: 'Comfortable running shoes',
        price: 129.99,
        categoryId: 'cat2',
        images: ['https://via.placeholder.com/300x200'],
        stock: 50,
        sku: 'NIKE-AM-001',
        rating: { average: 4.5, count: 67 },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  getMockCategories(): Category[] {
    return [
      {
        _id: 'cat1',
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        image: 'https://via.placeholder.com/150x150',
        productCount: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'cat2',
        name: 'Clothing',
        description: 'Fashion and apparel',
        image: 'https://via.placeholder.com/150x150',
        productCount: 23,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'cat3',
        name: 'Books',
        description: 'Books and literature',
        image: 'https://via.placeholder.com/150x150',
        productCount: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}
