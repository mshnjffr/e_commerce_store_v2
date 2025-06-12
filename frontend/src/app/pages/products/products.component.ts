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
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, SearchFiltersComponent, ProductGridComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
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
  
  // UI state for back-to-top button
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
    this.loadProducts();
  }

  private handleRouteParams() {
    this.route.queryParams.subscribe(params => {
      this.filters = {
        page: parseInt(params['page']) || 1,
        limit: parseInt(params['limit']) || 20,
        search: params['search'] || undefined,
        category: params['category'] || undefined,
        minPrice: params['minPrice'] ? parseFloat(params['minPrice']) : undefined,
        maxPrice: params['maxPrice'] ? parseFloat(params['maxPrice']) : undefined,
        sortBy: params['sortBy'] || undefined,
        sortOrder: params['sortOrder'] || undefined
      };
      
      this.currentPage = this.filters.page || 1;
      this.layout = params['layout'] === 'list' ? 'list' : 'grid';
    });
  }

  private updateURL() {
    const queryParams: any = {};
    
    if (this.filters.page && this.filters.page > 1) queryParams.page = this.filters.page;
    if (this.filters.search) queryParams.search = this.filters.search;
    if (this.filters.category) queryParams.category = this.filters.category;
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
        this.notificationService.showError('Failed to load products');
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
    this.filters = { ...newFilters, page: 1 };
    this.currentPage = 1;
    this.updateURL();
    this.loadProducts();
  }

  onClearFilters() {
    this.filters = { page: 1, limit: 20 };
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
    // Implement wishlist functionality if needed
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
}
