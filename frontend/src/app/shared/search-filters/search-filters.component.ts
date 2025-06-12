import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, ProductFilters } from '../../models/product.model';

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.css']
})
export class SearchFiltersComponent implements OnInit {
  @Input() categories: Category[] = [];
  @Input() filters: ProductFilters = {};
  @Input() isLoading: boolean = false;
  @Output() filtersChange = new EventEmitter<ProductFilters>();
  @Output() clearFilters = new EventEmitter<void>();

  // Filter form data
  searchTerm: string = '';
  selectedCategory: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minRating: number = 0;
  sortBy: string = '';
  sortOrder: string = 'asc';

  // UI state
  isFiltersExpanded: boolean = false;
  priceRangeLabel: string = '';

  // Sort options
  sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'createdAt', label: 'Newest' }
  ];

  // Rating options
  ratingOptions = [
    { value: 0, label: 'All Ratings' },
    { value: 1, label: '1+ Stars' },
    { value: 2, label: '2+ Stars' },
    { value: 3, label: '3+ Stars' },
    { value: 4, label: '4+ Stars' },
    { value: 5, label: '5 Stars' }
  ];

  ngOnInit() {
    this.initializeFilters();
    this.updatePriceRangeLabel();
  }

  ngOnChanges() {
    this.initializeFilters();
  }

  private initializeFilters() {
    this.searchTerm = this.filters.search || '';
    this.selectedCategory = this.filters.category || '';
    this.minPrice = this.filters.minPrice || null;
    this.maxPrice = this.filters.maxPrice || null;
    this.sortBy = this.filters.sortBy || '';
    this.sortOrder = this.filters.sortOrder || 'asc';
    this.updatePriceRangeLabel();
  }

  onSearchChange() {
    this.emitFilters();
  }

  onCategoryChange() {
    this.emitFilters();
  }

  onPriceChange() {
    this.updatePriceRangeLabel();
    this.emitFilters();
  }

  onRatingChange() {
    this.emitFilters();
  }

  onSortChange() {
    this.emitFilters();
  }

  private updatePriceRangeLabel() {
    if (this.minPrice !== null && this.maxPrice !== null) {
      this.priceRangeLabel = `$${this.minPrice} - $${this.maxPrice}`;
    } else if (this.minPrice !== null) {
      this.priceRangeLabel = `$${this.minPrice}+`;
    } else if (this.maxPrice !== null) {
      this.priceRangeLabel = `Up to $${this.maxPrice}`;
    } else {
      this.priceRangeLabel = 'Any Price';
    }
  }

  private emitFilters() {
    const newFilters: ProductFilters = {
      ...this.filters,
      search: this.searchTerm || undefined,
      category: this.selectedCategory || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      sortBy: this.sortBy as any || undefined,
      sortOrder: this.sortOrder as any || undefined,
      page: 1 // Reset to first page when filters change
    };

    // Remove undefined values
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key as keyof ProductFilters] === undefined) {
        delete newFilters[key as keyof ProductFilters];
      }
    });

    this.filtersChange.emit(newFilters);
  }

  onClearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.minRating = 0;
    this.sortBy = '';
    this.sortOrder = 'asc';
    this.updatePriceRangeLabel();
    this.clearFilters.emit();
  }

  toggleFilters() {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.selectedCategory ||
      this.minPrice ||
      this.maxPrice ||
      this.minRating > 0 ||
      this.sortBy
    );
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchTerm) count++;
    if (this.selectedCategory) count++;
    if (this.minPrice || this.maxPrice) count++;
    if (this.minRating > 0) count++;
    if (this.sortBy) count++;
    return count;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown';
  }

  getSortLabel(): string {
    const sortOption = this.sortOptions.find(opt => opt.value === this.sortBy);
    const sortLabel = sortOption ? sortOption.label : this.sortBy;
    const orderLabel = this.sortOrder === 'desc' ? 'Desc' : 'Asc';
    return `${sortLabel} (${orderLabel})`;
  }
}
