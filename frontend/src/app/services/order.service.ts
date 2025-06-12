import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Order, 
  CreateOrderRequest, 
  OrderFilters, 
  OrderStats, 
  UpdateOrderStatusRequest 
} from '../models/order.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  createOrder(orderData: CreateOrderRequest): Observable<ApiResponse<{ order: Order }>> {
    return this.http.post<ApiResponse<{ order: Order }>>(this.baseUrl, orderData);
  }

  getUserOrders(filters?: OrderFilters): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.status) params = params.set('status', filters.status);
    }

    return this.http.get<PaginatedResponse<Order>>(this.baseUrl, { params });
  }

  getOrder(id: string): Observable<ApiResponse<{ order: Order }>> {
    return this.http.get<ApiResponse<{ order: Order }>>(`${this.baseUrl}/${id}`);
  }

  cancelOrder(id: string): Observable<ApiResponse<{ order: Order }>> {
    return this.http.put<ApiResponse<{ order: Order }>>(`${this.baseUrl}/${id}/cancel`, {});
  }

  // Admin endpoints
  getAllOrders(filters?: OrderFilters): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.status) params = params.set('status', filters.status);
    }

    return this.http.get<PaginatedResponse<Order>>(`${this.baseUrl}/admin/all`, { params });
  }

  updateOrderStatus(id: string, statusData: UpdateOrderStatusRequest): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.baseUrl}/admin/${id}/status`, statusData);
  }

  getOrderStats(): Observable<ApiResponse<OrderStats>> {
    return this.http.get<ApiResponse<OrderStats>>(`${this.baseUrl}/admin/stats`);
  }
}
