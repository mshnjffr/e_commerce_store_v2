import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Product, 
  Category, 
  ProductFilters, 
  AddReviewRequest 
} from '../models/product.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = `${environment.apiUrl}/products`;
  private categoriesUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  getProducts(filters?: ProductFilters): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.category) params = params.set('category', filters.category);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<PaginatedResponse<Product>>(this.baseUrl, { params });
  }

  getProduct(id: string): Observable<ApiResponse<{ product: Product }>> {
    return this.http.get<ApiResponse<{ product: Product }>>(`${this.baseUrl}/${id}`);
  }

  getFeaturedProducts(limit = 8): Observable<ApiResponse<{ products: Product[] }>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse<{ products: Product[] }>>(`${this.baseUrl}/featured`, { params });
  }

  getProductsByCategory(categoryId: string, filters?: Partial<ProductFilters>): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedResponse<Product>>(`${this.baseUrl}/category/${categoryId}`, { params });
  }

  addProductReview(productId: string, review: AddReviewRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${productId}/rating`, review);
  }

  getCategories(): Observable<ApiResponse<{ categories: Category[] }>> {
    return this.http.get<ApiResponse<{ categories: Category[] }>>(this.categoriesUrl);
  }

  getCategoriesHierarchy(): Observable<ApiResponse<{ categories: Category[] }>> {
    return this.http.get<ApiResponse<{ categories: Category[] }>>(`${this.categoriesUrl}/hierarchy`);
  }

  getCategoriesWithCount(): Observable<ApiResponse<{ categories: Category[] }>> {
    return this.http.get<ApiResponse<{ categories: Category[] }>>(`${this.categoriesUrl}/with-count`);
  }

  getCategory(id: string): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.categoriesUrl}/${id}`);
  }
}
