import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css']
})
export class ProductGridComponent {
  @Input() products: Product[] = [];
  @Input() isLoading: boolean = false;
  @Input() layout: 'grid' | 'list' = 'grid';
  @Input() showLoadMore: boolean = false;
  @Input() hasMore: boolean = false;
  @Input() emptyMessage: string = 'No products found';
  @Output() addToCart = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();
  @Output() loadMore = new EventEmitter<void>();

  onAddToCart(product: Product) {
    this.addToCart.emit(product);
  }

  onAddToWishlist(product: Product) {
    this.addToWishlist.emit(product);
  }

  onLoadMore() {
    if (this.hasMore && !this.isLoading) {
      this.loadMore.emit();
    }
  }

  trackByProductId(index: number, product: Product): string {
    return product._id;
  }
}
