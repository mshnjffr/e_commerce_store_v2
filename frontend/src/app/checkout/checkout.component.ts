import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import { Cart } from '../models/cart.model';
import { PaymentMethod } from '../models/order.model';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  isLoading = false;
  isSubmitting = false;
  orderPlaced = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cart = response.data;
          if (this.cart.items.length === 0) {
            this.notificationService.showError('Your cart is empty');
            this.router.navigate(['/cart']);
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.notificationService.showError('Failed to load cart');
        this.isLoading = false;
        this.router.navigate(['/cart']);
      }
    });
  }

  getSubtotal(): number {
    return this.cart?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  }

  getShippingCost(): number {
    const subtotal = this.getSubtotal();
    return subtotal > 50 ? 0 : 10;
  }

  getTax(): number {
    return this.getSubtotal() * 0.08;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost() + this.getTax();
  }

  placeOrder() {
    if (!this.cart || this.cart.items.length === 0) {
      this.notificationService.showError('Your cart is empty');
      return;
    }

    this.isSubmitting = true;
    
    // Create order with minimal required data
    const orderRequest = {
      shippingAddress: {
        street: 'Demo Address',
        city: 'Demo City', 
        state: 'Demo State',
        zipCode: '12345',
        country: 'USA'
      },
      paymentMethod: 'cash_on_delivery' as PaymentMethod
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orderPlaced = true;
          this.notificationService.showSuccess('Order placed successfully!');
          
          // Navigate to orders page after a delay
          setTimeout(() => {
            this.router.navigate(['/orders', response.data!.order._id]);
          }, 3000);
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.notificationService.showError(error.error?.message || 'Failed to place order');
        this.isSubmitting = false;
      }
    });
  }

}
