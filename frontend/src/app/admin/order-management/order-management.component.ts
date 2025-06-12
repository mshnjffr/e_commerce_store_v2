import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { Order, OrderStatus, PaymentStatus } from '../../models/order.model';

@Component({
  selector: 'app-order-management',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  selectedStatus: OrderStatus | '' = '';
  
  stats = {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  };

  statusOptions: { value: OrderStatus | '', label: string, color: string }[] = [
    { value: '', label: 'All Orders', color: '#6c757d' },
    { value: 'pending', label: 'Pending', color: '#ffc107' },
    { value: 'confirmed', label: 'Confirmed', color: '#17a2b8' },
    { value: 'processing', label: 'Processing', color: '#007bff' },
    { value: 'shipped', label: 'Shipped', color: '#fd7e14' },
    { value: 'delivered', label: 'Delivered', color: '#28a745' },
    { value: 'cancelled', label: 'Cancelled', color: '#dc3545' }
  ];

  paymentStatusOptions: { value: PaymentStatus, label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.loadStats();
    this.loadOrders();
  }

  loadStats() {
    this.orderService.getOrderStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
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

    this.orderService.getAllOrders(filters).subscribe({
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

  updateOrderStatus(order: Order, newStatus: OrderStatus) {
    this.orderService.updateOrderStatus(order._id, { status: newStatus }).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess(`Order ${order.orderNumber} status updated to ${newStatus}`);
          this.loadOrders();
          this.loadStats();
        }
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.notificationService.showError(error.error?.message || 'Failed to update order status');
      }
    });
  }

  updatePaymentStatus(order: Order, newPaymentStatus: PaymentStatus) {
    this.orderService.updateOrderStatus(order._id, { 
      status: order.status, 
      paymentStatus: newPaymentStatus 
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess(`Payment status updated for order ${order.orderNumber}`);
          this.loadOrders();
          this.loadStats();
        }
      },
      error: (error) => {
        console.error('Error updating payment status:', error);
        this.notificationService.showError(error.error?.message || 'Failed to update payment status');
      }
    });
  }

  getStatusInfo(status: OrderStatus | string) {
    return this.statusOptions.find(option => option.value === status);
  }

  getStatusIcon(status: OrderStatus | string): string {
    const icons: { [key: string]: string } = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '📦',
      cancelled: '❌'
    };
    return icons[status as string] || '❓';
  }

  getPaymentStatusClass(status: PaymentStatus): string {
    const classes: { [key in PaymentStatus]: string } = {
      pending: 'badge-warning',
      completed: 'badge-success',
      failed: 'badge-danger',
      refunded: 'badge-info'
    };
    return classes[status];
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

  exportOrders() {
    // Mock export functionality
    this.notificationService.showSuccess('Order export feature coming soon!');
  }

  getCustomerName(order: Order): string {
    if (order.user) {
      return `${order.user.firstName} ${order.user.lastName}`;
    }
    return 'N/A';
  }

  getCustomerEmail(order: Order): string {
    return order.user?.email || 'N/A';
  }

  onOrderStatusChange(order: Order, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateOrderStatus(order, target.value as OrderStatus);
  }

  onPaymentStatusChange(order: Order, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updatePaymentStatus(order, target.value as PaymentStatus);
  }
}
