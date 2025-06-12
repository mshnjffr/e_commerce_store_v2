import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { Product, Category, ProductFilters } from '../../models/product.model';
import { PaginatedResponse } from '../../models/api-response.model';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  isLoading = false;
  
  // Filters
  filters: ProductFilters = {
    page: 1,
    limit: 20
  };
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  showingFrom = 0;
  showingTo = 0;

  // Product form
  isEditing = false;
  currentProduct: Partial<Product> = {};
  showProductForm = false;

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts(this.filters).subscribe({
      next: (response: PaginatedResponse<Product>) => {
        if (response.success && response.data) {
          this.products = response.data.items || [];
          this.updatePaginationInfo(response);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.notificationService.showError('Failed to load products');
        this.isLoading = false;
      }
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data.categories;
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  private updatePaginationInfo(response: PaginatedResponse<Product>) {
    this.currentPage = response.data.pagination?.currentPage || 1;
    this.totalPages = response.data.pagination?.totalPages || 1;
    this.totalProducts = response.data.pagination?.totalItems || 0;
    
    const limit = this.filters.limit || 20;
    this.showingFrom = ((this.currentPage - 1) * limit) + 1;
    this.showingTo = Math.min(this.currentPage * limit, this.totalProducts);
  }

  // Product CRUD operations
  showAddProductForm() {
    this.currentProduct = {
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      images: [],
      stock: 0,
      sku: '',
      featured: false
    };
    this.isEditing = false;
    this.showProductForm = true;
  }

  editProduct(product: Product) {
    this.currentProduct = { ...product };
    this.isEditing = true;
    this.showProductForm = true;
  }

  saveProduct() {
    if (!this.isValidProduct()) {
      this.notificationService.showError('Please fill in all required fields');
      return;
    }

    // In a real app, you would call the API to save/update the product
    if (this.isEditing) {
      this.notificationService.showSuccess('Product updated successfully!');
    } else {
      this.notificationService.showSuccess('Product created successfully!');
    }
    
    this.cancelEdit();
    this.loadProducts();
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      // In a real app, you would call the API to delete the product
      this.notificationService.showSuccess('Product deleted successfully!');
      this.loadProducts();
    }
  }

  cancelEdit() {
    this.currentProduct = {};
    this.isEditing = false;
    this.showProductForm = false;
  }

  private isValidProduct(): boolean {
    return !!(
      this.currentProduct.name &&
      this.currentProduct.description &&
      this.currentProduct.price &&
      this.currentProduct.categoryId &&
      this.currentProduct.sku
    );
  }

  // Pagination
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.filters.page = page;
      this.loadProducts();
    }
  }

  // Search and filter
  onSearchChange(searchTerm: string) {
    this.filters.search = searchTerm || undefined;
    this.filters.page = 1;
    this.loadProducts();
  }

  onCategoryFilter(categoryId: string) {
    this.filters.category = categoryId || undefined;
    this.filters.page = 1;
    this.loadProducts();
  }

  // Utility methods
  getCategoryName(categoryId: string | Category): string {
    if (typeof categoryId === 'object' && categoryId !== null) {
      return categoryId.name;
    }
    const category = this.categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown';
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getStockStatus(stock: number): string {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  }

  getStockClass(stock: number): string {
    if (stock <= 0) return 'text-danger';
    if (stock <= 10) return 'text-warning';
    return 'text-success';
  }

  addImageUrl() {
    if (!this.currentProduct.images) {
      this.currentProduct.images = [];
    }
    this.currentProduct.images.push('');
  }

  removeImageUrl(index: number) {
    if (this.currentProduct.images) {
      this.currentProduct.images.splice(index, 1);
    }
  }

  trackByProductId(index: number, product: Product): string {
    return product._id;
  }
}
