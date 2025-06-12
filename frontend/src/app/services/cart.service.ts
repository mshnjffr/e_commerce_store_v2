import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Cart, 
  CartSummary, 
  AddToCartRequest, 
  UpdateCartItemRequest,
  CartItem 
} from '../models/cart.model';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';

interface GuestCartItem {
  productId: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  private cartSummarySubject = new BehaviorSubject<CartSummary>({ itemCount: 0, totalAmount: 0 });
  private guestCartKey = 'guestCart';

  cart$ = this.cartSubject.asObservable();
  cartSummary$ = this.cartSummarySubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Listen to auth state changes
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.mergeGuestCartWithUserCart();
      } else {
        this.loadGuestCart();
      }
    });
  }

  getCart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(this.baseUrl)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.cartSubject.next(response.data);
            this.updateCartSummary(response.data);
          }
        })
      );
  }

  getCartCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.baseUrl}/count`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const current = this.cartSummarySubject.value;
            this.cartSummarySubject.next({ 
              ...current,
              itemCount: response.data.count 
            });
          }
        })
      );
  }

  addToCart(item: AddToCartRequest): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(`${this.baseUrl}/add`, item)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.cartSubject.next(response.data);
            this.updateCartSummary(response.data);
          }
        })
      );
  }

  updateCartItem(productId: string, update: UpdateCartItemRequest): Observable<ApiResponse<Cart>> {
    return this.http.put<ApiResponse<Cart>>(`${this.baseUrl}/item/${productId}`, update)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.cartSubject.next(response.data);
            this.updateCartSummary(response.data);
          }
        })
      );
  }

  removeFromCart(productId: string): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`${this.baseUrl}/item/${productId}`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.cartSubject.next(response.data);
            this.updateCartSummary(response.data);
          }
        })
      );
  }

  clearCart(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/clear`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.cartSubject.next(null);
            this.cartSummarySubject.next({ itemCount: 0, totalAmount: 0 });
          }
        })
      );
  }

  private updateCartSummary(cart: Cart) {
    const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
    this.cartSummarySubject.next({
      itemCount,
      totalAmount: cart.totalAmount
    });
  }

  get currentCart(): Cart | null {
    return this.cartSubject.value;
  }

  get cartSummary(): CartSummary {
    return this.cartSummarySubject.value;
  }

  // Guest cart management
  private getGuestCart(): GuestCartItem[] {
    const cartJson = localStorage.getItem(this.guestCartKey);
    return cartJson ? JSON.parse(cartJson) : [];
  }

  private saveGuestCart(cart: GuestCartItem[]) {
    localStorage.setItem(this.guestCartKey, JSON.stringify(cart));
    this.updateGuestCartSummary(cart);
  }

  private updateGuestCartSummary(cart: GuestCartItem[]) {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    this.cartSummarySubject.next({
      itemCount,
      totalAmount: 0 // We don't have price info for guest cart
    });
  }

  private loadGuestCart() {
    if (!this.authService.isAuthenticated) {
      const guestCart = this.getGuestCart();
      this.updateGuestCartSummary(guestCart);
    }
  }

  addToGuestCart(productId: string, quantity: number = 1) {
    const guestCart = this.getGuestCart();
    const existingItem = guestCart.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      guestCart.push({ productId, quantity });
    }
    
    this.saveGuestCart(guestCart);
  }

  removeFromGuestCart(productId: string) {
    const guestCart = this.getGuestCart().filter(item => item.productId !== productId);
    this.saveGuestCart(guestCart);
  }

  updateGuestCartQuantity(productId: string, quantity: number) {
    const guestCart = this.getGuestCart();
    const item = guestCart.find(item => item.productId === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromGuestCart(productId);
      } else {
        item.quantity = quantity;
        this.saveGuestCart(guestCart);
      }
    }
  }

  clearGuestCart() {
    localStorage.removeItem(this.guestCartKey);
    this.cartSummarySubject.next({ itemCount: 0, totalAmount: 0 });
  }

  private mergeGuestCartWithUserCart() {
    const guestCart = this.getGuestCart();
    
    if (guestCart.length > 0 && this.authService.isAuthenticated) {
      console.log('Merging guest cart with user cart...');
      
      // Get current user cart first to avoid duplicates
      this.getCart().subscribe({
        next: (response) => {
          const userCart = response.data;
          const existingProductIds = new Set(userCart?.items.map(item => item.productId._id) || []);
          
          // Filter out items that already exist in user cart
          const itemsToMerge = guestCart.filter(guestItem => 
            !existingProductIds.has(guestItem.productId)
          );
          
          if (itemsToMerge.length > 0) {
            // Convert guest cart items to API calls, handling failures individually
            const mergePromises = itemsToMerge.map(item => 
              this.addToCart({ productId: item.productId, quantity: item.quantity }).toPromise()
                .catch(error => {
                  console.warn(`Failed to merge item ${item.productId}:`, error);
                  return null; // Return null for failed items
                })
            );

            Promise.all(mergePromises).then((results) => {
              const successfulMerges = results.filter(result => result !== null);
              console.log(`Successfully merged ${successfulMerges.length} of ${itemsToMerge.length} new guest cart items`);
              
              // Always clear guest cart after merge attempt
              this.clearGuestCart();
              // Reload user cart
              this.getCart().subscribe();
            }).catch(error => {
              console.error('Error merging guest cart:', error);
              // Clear guest cart even on error to prevent repeated failures
              this.clearGuestCart();
            });
          } else {
            console.log('No new items to merge - all guest cart items already exist in user cart');
            // Clear guest cart since no new items to add
            this.clearGuestCart();
          }
        },
        error: (error) => {
          console.error('Error getting user cart for merge:', error);
          // Clear guest cart to prevent repeated failures
          this.clearGuestCart();
        }
      });
    }
  }

  // Override addToCart to handle guest users
  addToCartSmart(item: AddToCartRequest): Observable<ApiResponse<Cart>> {
    if (this.authService.isAuthenticated) {
      return this.addToCart(item);
    } else {
      // Add to guest cart
      this.addToGuestCart(item.productId, item.quantity);
      
      // Return a mock response for consistency
      return of({
        success: true,
        message: 'Item added to cart',
        data: undefined
      } as ApiResponse<Cart>);
    }
  }

  getGuestCartCount(): number {
    const guestCart = this.getGuestCart();
    return guestCart.reduce((sum, item) => sum + item.quantity, 0);
  }
}
