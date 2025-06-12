import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.css']
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Input() showQuantityControls = true;
  @Input() showRemoveButton = true;
  @Input() compact = false;
  @Input() disabled = false;

  @Output() quantityChange = new EventEmitter<{ productId: string, quantity: number }>();
  @Output() removeItem = new EventEmitter<string>();
  @Output() viewProduct = new EventEmitter<string>();

  updateQuantity(change: number) {
    const newQuantity = this.item.quantity + change;
    if (newQuantity >= 1 && newQuantity <= this.item.productId.stock) {
      this.quantityChange.emit({ 
        productId: this.item.productId._id, 
        quantity: newQuantity 
      });
    }
  }

  onRemoveItem() {
    this.removeItem.emit(this.item.productId._id);
  }

  onViewProduct() {
    this.viewProduct.emit(this.item.productId._id);
  }

  get totalPrice(): number {
    return this.item.productId.price * this.item.quantity;
  }

  get stockStatus(): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (this.item.productId.stock <= 0) return 'out-of-stock';
    if (this.item.productId.stock <= 10) return 'low-stock';
    return 'in-stock';
  }

  get stockText(): string {
    switch (this.stockStatus) {
      case 'out-of-stock':
        return 'Out of stock';
      case 'low-stock':
        return `Only ${this.item.productId.stock} left`;
      default:
        return `${this.item.productId.stock} in stock`;
    }
  }

  get canIncreaseQuantity(): boolean {
    return !this.disabled && this.item.quantity < this.item.productId.stock;
  }

  get canDecreaseQuantity(): boolean {
    return !this.disabled && this.item.quantity > 1;
  }
}
