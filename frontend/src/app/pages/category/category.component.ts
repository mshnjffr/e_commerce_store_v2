import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { Product, Category, ProductFilters } from '../../models/product.model';
import { PaginatedResponse } from '../../models/api-response.model';
import { SearchFiltersComponent } from '../../shared/search-filters/search-filters.component';
import { ProductGridComponent } from '../../shared/product-grid/product-grid.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, SearchFiltersComponent, ProductGridComponent],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  category: Category | null = null;
  products: Product[] = [];
  categories: Category[] = [];
  filters: ProductFilters = {
    page: 1,
    limit: 20
  };
  
  // UI state
  isLoading = false;
  isLoadingMore = false;
  layout: 'grid' | 'list' = 'grid';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  hasMore = false;

  // Results info
  showingFrom = 0;
  showingTo = 0;
  showBackToTop = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Listen for scroll events
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.showBackToTop = window.pageYOffset > 500;
      });
    }
  }

  ngOnInit() {
    this.loadCategories();
    this.handleRouteParams();
  }

  private handleRouteParams() {
    this.route.params.subscribe(params => {
      const categoryId = params['id'];
      if (categoryId) {
        this.filters.category = categoryId;
        this.loadCategory(categoryId);
        this.handleQueryParams();
      }
    });
  }

  private handleQueryParams() {
    this.route.queryParams.subscribe(params => {
      this.filters = {
        ...this.filters,
        page: parseInt(params['page']) || 1,
        limit: parseInt(params['limit']) || 20,
        search: params['search'] || undefined,
        minPrice: params['minPrice'] ? parseFloat(params['minPrice']) : undefined,
        maxPrice: params['maxPrice'] ? parseFloat(params['maxPrice']) : undefined,
        sortBy: params['sortBy'] || undefined,
        sortOrder: params['sortOrder'] || undefined
      };
      
      this.currentPage = this.filters.page || 1;
      this.layout = params['layout'] === 'list' ? 'list' : 'grid';
      this.loadProducts();
    });
  }

  private updateURL() {
    const queryParams: any = {};
    
    if (this.filters.page && this.filters.page > 1) queryParams.page = this.filters.page;
    if (this.filters.search) queryParams.search = this.filters.search;
    if (this.filters.minPrice) queryParams.minPrice = this.filters.minPrice;
    if (this.filters.maxPrice) queryParams.maxPrice = this.filters.maxPrice;
    if (this.filters.sortBy) queryParams.sortBy = this.filters.sortBy;
    if (this.filters.sortOrder) queryParams.sortOrder = this.filters.sortOrder;
    if (this.layout === 'list') queryParams.layout = 'list';

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace'
    });
  }

  loadCategory(categoryId: string) {
    this.productService.getCategory(categoryId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.category = response.data;
        } else {
          this.notificationService.showError('Category not found');
          this.router.navigate(['/products']);
        }
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.notificationService.showError('Error loading category');
        this.router.navigate(['/products']);
      }
    });
  }

  loadCategories() {
    this.productService.getCategoriesWithCount().subscribe({
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

  loadProducts(append = false) {
    if (append) {
      this.isLoadingMore = true;
    } else {
      this.isLoading = true;
      this.products = [];
    }

    this.productService.getProducts(this.filters).subscribe({
      next: (response: PaginatedResponse<Product>) => {
        if (response.success && response.data) {
          if (append) {
            this.products = [...this.products, ...(response.data.products || [])];
          } else {
            this.products = response.data.products || [];
          }
          
          this.updatePaginationInfo(response);
        }
        
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        // For demo purposes, show some mock products if backend is not available
        this.products = this.getMockProductsForCategory();
        this.totalProducts = this.products.length;
        this.showingFrom = 1;
        this.showingTo = this.products.length;
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  private updatePaginationInfo(response: PaginatedResponse<Product>) {
    this.currentPage = response.data.pagination?.currentPage || 1;
    this.totalPages = response.data.pagination?.totalPages || 1;
    this.totalProducts = response.data.pagination?.totalItems || 0;
    this.hasMore = this.currentPage < this.totalPages;
    
    const limit = this.filters.limit || 20;
    this.showingFrom = ((this.currentPage - 1) * limit) + 1;
    this.showingTo = Math.min(this.currentPage * limit, this.totalProducts);
  }

  onFiltersChange(newFilters: ProductFilters) {
    // Preserve the category filter
    this.filters = { ...newFilters, page: 1, category: this.filters.category };
    this.currentPage = 1;
    this.updateURL();
    this.loadProducts();
  }

  onClearFilters() {
    this.filters = { 
      page: 1, 
      limit: 20, 
      category: this.filters.category // Preserve category
    };
    this.currentPage = 1;
    this.updateURL();
    this.loadProducts();
  }

  onLayoutChange(newLayout: 'grid' | 'list') {
    this.layout = newLayout;
    this.updateURL();
  }

  onLoadMore() {
    if (this.hasMore && !this.isLoadingMore) {
      this.filters.page = (this.filters.page || 1) + 1;
      this.currentPage = this.filters.page;
      this.updateURL();
      this.loadProducts(true);
    }
  }

  onAddToCart(product: Product) {
    // Cart addition is handled by the add-to-cart-button component
    // This event handler is for any additional logic needed after adding to cart
    console.log(`${product.name} was added to cart via add-to-cart-button component`);
  }

  onAddToWishlist(product: Product) {
    this.notificationService.showInfo(`${product.name} added to wishlist!`);
  }

  scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Navigation methods
  goToFirstPage() {
    if (this.currentPage !== 1) {
      this.filters.page = 1;
      this.currentPage = 1;
      this.updateURL();
      this.loadProducts();
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.filters.page = this.currentPage - 1;
      this.currentPage = this.filters.page;
      this.updateURL();
      this.loadProducts();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.filters.page = this.currentPage + 1;
      this.currentPage = this.filters.page;
      this.updateURL();
      this.loadProducts();
    }
  }

  goToLastPage() {
    if (this.currentPage !== this.totalPages) {
      this.filters.page = this.totalPages;
      this.currentPage = this.totalPages;
      this.updateURL();
      this.loadProducts();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.filters.page = page;
      this.currentPage = page;
      this.updateURL();
      this.loadProducts();
    }
  }

  getVisiblePageNumbers(): number[] {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, this.currentPage - delta);
         i <= Math.min(this.totalPages - 1, this.currentPage + delta);
         i++) {
      range.push(i);
    }

    if (this.currentPage - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (this.currentPage + delta < this.totalPages - 1) {
      rangeWithDots.push(-1, this.totalPages);
    } else {
      if (this.totalPages > 1) {
        rangeWithDots.push(this.totalPages);
      }
    }

    return rangeWithDots;
  }

  getMockProductsForCategory(): Product[] {
    // Return different products based on the category
    const categoryId = this.filters.category;
    const baseProducts = [
      {
        _id: '1',
        name: 'MacBook Pro M3',
        description: 'Powerful laptop for professionals',
        price: 2499.99,
        categoryId: '6849c22c44c9514b4024f1aa', // Electronics
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
        categoryId: '6849c22c44c9514b4024f1aa', // Electronics
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
        categoryId: '6849c22c44c9514b4024f1ab', // Clothing
        images: ['https://via.placeholder.com/300x200'],
        stock: 50,
        sku: 'NIKE-AM-001',
        rating: { average: 4.5, count: 67 },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '4',
        name: 'Harry Potter Series',
        description: 'Complete book collection',
        price: 89.99,
        categoryId: '6849c22c44c9514b4024f1ac', // Books
        images: ['https://via.placeholder.com/300x200'],
        stock: 15,
        sku: 'HP-SERIES-001',
        rating: { average: 4.7, count: 234 },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Filter products based on the current category
    if (categoryId) {
      return baseProducts.filter(product => product.categoryId === categoryId);
    }
    
    return baseProducts;
  }
}
