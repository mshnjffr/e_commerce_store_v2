import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import { Order, OrderStatus } from '../models/order.model';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  selectedStatus: OrderStatus | '' = '';

  statusOptions: { value: OrderStatus | '', label: string, color: string }[] = [
    { value: '', label: 'All Orders', color: '#6c757d' },
    { value: 'pending', label: 'Pending', color: '#ffc107' },
    { value: 'confirmed', label: 'Confirmed', color: '#17a2b8' },
    { value: 'processing', label: 'Processing', color: '#007bff' },
    { value: 'shipped', label: 'Shipped', color: '#fd7e14' },
    { value: 'delivered', label: 'Delivered', color: '#28a745' },
    { value: 'cancelled', label: 'Cancelled', color: '#dc3545' }
  ];

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    
    const filters: any = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    if (this.selectedStatus) {
      filters.status = this.selectedStatus;
    }

    this.orderService.getUserOrders(filters).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders = response.data.orders || [];
          this.totalPages = response.data.pagination?.totalPages || 1;
          this.totalItems = response.data.pagination?.totalItems || 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.notificationService.showError('Failed to load orders');
        this.isLoading = false;
      }
    });
  }

  onStatusChange() {
    this.currentPage = 1;
    this.loadOrders();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadOrders();
  }

  getStatusInfo(status: OrderStatus | string) {
    return this.statusOptions.find(option => option.value === status);
  }

  getStatusIcon(status: OrderStatus): string {
    const icons: { [key in OrderStatus]: string } = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '📦',
      cancelled: '❌'
    };
    return icons[status];
  }

  canCancelOrder(order: Order): boolean {
    return order.status === 'pending' || order.status === 'confirmed';
  }

  cancelOrder(order: Order) {
    if (!this.canCancelOrder(order)) {
      this.notificationService.showError('This order cannot be cancelled');
      return;
    }

    if (confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)) {
      this.orderService.cancelOrder(order._id).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('Order cancelled successfully');
            this.loadOrders(); // Reload orders to reflect changes
          }
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          this.notificationService.showError(error.error?.message || 'Failed to cancel order');
        }
      });
    }
  }

  getOrderTotal(order: Order): number {
    return order.items.reduce((total, item) => total + item.totalPrice, 0);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByOrderId(index: number, order: Order): string {
    return order._id;
  }
}
