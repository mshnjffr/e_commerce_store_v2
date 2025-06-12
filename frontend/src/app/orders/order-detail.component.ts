import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import { Order, OrderStatus } from '../models/order.model';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading = false;
  orderId: string = '';

  statusOptions: { value: OrderStatus, label: string, color: string }[] = [
    { value: 'pending', label: 'Pending', color: '#ffc107' },
    { value: 'confirmed', label: 'Confirmed', color: '#17a2b8' },
    { value: 'processing', label: 'Processing', color: '#007bff' },
    { value: 'shipped', label: 'Shipped', color: '#fd7e14' },
    { value: 'delivered', label: 'Delivered', color: '#28a745' },
    { value: 'cancelled', label: 'Cancelled', color: '#dc3545' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      if (this.orderId) {
        this.loadOrder();
      }
    });
  }

  loadOrder() {
    this.isLoading = true;
    
    this.orderService.getOrder(this.orderId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.order = response.data.order;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.notificationService.showError('Failed to load order details');
        this.isLoading = false;
        this.router.navigate(['/orders']);
      }
    });
  }

  getStatusInfo(status: OrderStatus) {
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

  canCancelOrder(): boolean {
    return this.order ? (this.order.status === 'pending' || this.order.status === 'confirmed') : false;
  }

  cancelOrder() {
    if (!this.order || !this.canCancelOrder()) {
      this.notificationService.showError('This order cannot be cancelled');
      return;
    }

    if (confirm(`Are you sure you want to cancel order ${this.order.orderNumber}?`)) {
      this.orderService.cancelOrder(this.order._id).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.order = response.data.order;
            this.notificationService.showSuccess('Order cancelled successfully');
          }
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          this.notificationService.showError(error.error?.message || 'Failed to cancel order');
        }
      });
    }
  }

  getOrderSubtotal(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((total, item) => total + item.totalPrice, 0);
  }

  getShippingCost(): number {
    const subtotal = this.getOrderSubtotal();
    return subtotal > 50 ? 0 : 10;
  }

  getTax(): number {
    return this.getOrderSubtotal() * 0.08;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstimatedDelivery(): string {
    if (!this.order) return '';
    
    const orderDate = new Date(this.order.createdAt);
    const deliveryDate = new Date(orderDate);
    
    // Add delivery days based on status
    switch (this.order.status) {
      case 'pending':
      case 'confirmed':
        deliveryDate.setDate(orderDate.getDate() + 7);
        break;
      case 'processing':
        deliveryDate.setDate(orderDate.getDate() + 5);
        break;
      case 'shipped':
        deliveryDate.setDate(orderDate.getDate() + 2);
        break;
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
    }
    
    return deliveryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTrackingMessage(): string {
    if (!this.order) return '';
    
    switch (this.order.status) {
      case 'pending':
        return 'Your order is being prepared for confirmation.';
      case 'confirmed':
        return 'Your order has been confirmed and will be processed soon.';
      case 'processing':
        return 'Your order is being processed and packaged.';
      case 'shipped':
        return 'Your order has been shipped and is on its way to you.';
      case 'delivered':
        return 'Your order has been delivered successfully.';
      case 'cancelled':
        return 'This order has been cancelled.';
      default:
        return '';
    }
  }
}
