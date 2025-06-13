import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Wishlist, 
  WishlistSummary, 
  AddToWishlistRequest, 
  UpdateWishlistItemRequest,
  WishlistItem 
} from '../models/wishlist.model';
import { Product } from '../models/product.model';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';

interface GuestWishlistItem {
  productId: string;
  addedAt: Date;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private baseUrl = `${environment.apiUrl}/wishlist`;
  private wishlistSubject = new BehaviorSubject<Wishlist | null>(null);
  private wishlistSummarySubject = new BehaviorSubject<WishlistSummary>({ itemCount: 0, hasItems: false });
  private guestWishlistKey = 'guestWishlist';

  wishlist$ = this.wishlistSubject.asObservable();
  wishlistSummary$ = this.wishlistSummarySubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Listen to auth state changes
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.mergeGuestWishlistWithUserWishlist();
      } else {
        this.loadGuestWishlist();
      }
    });
  }

  getWishlist(): Observable<ApiResponse<Wishlist>> {
    return this.http.get<ApiResponse<Wishlist>>(this.baseUrl)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.wishlistSubject.next(response.data);
            this.updateWishlistSummary(response.data);
          }
        })
      );
  }

  getWishlistCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.baseUrl}/count`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const current = this.wishlistSummarySubject.value;
            this.wishlistSummarySubject.next({ 
              ...current,
              itemCount: response.data.count,
              hasItems: response.data.count > 0
            });
          }
        })
      );
  }

  addToWishlist(product: Product, notes?: string): Observable<ApiResponse<Wishlist>> {
    if (this.authService.isAuthenticated) {
      const request: AddToWishlistRequest = {
        productId: product._id,
        notes
      };

      return this.http.post<ApiResponse<Wishlist>>(`${this.baseUrl}/add`, request)
        .pipe(
          tap(response => {
            if (response.success && response.data) {
              this.wishlistSubject.next(response.data);
              this.updateWishlistSummary(response.data);
            }
          })
        );
    } else {
      // Add to guest wishlist
      this.addToGuestWishlist(product._id, notes);
      
      // Return a mock response for consistency
      return of({
        success: true,
        message: 'Item added to wishlist',
        data: undefined
      } as ApiResponse<Wishlist>);
    }
  }

  removeFromWishlist(productId: string): Observable<ApiResponse<Wishlist>> {
    if (this.authService.isAuthenticated) {
      return this.http.delete<ApiResponse<Wishlist>>(`${this.baseUrl}/item/${productId}`)
        .pipe(
          tap(response => {
            if (response.success && response.data) {
              this.wishlistSubject.next(response.data);
              this.updateWishlistSummary(response.data);
            }
          })
        );
    } else {
      // Remove from guest wishlist
      this.removeFromGuestWishlist(productId);
      
      // Return a mock response for consistency
      return of({
        success: true,
        message: 'Item removed from wishlist',
        data: undefined
      } as ApiResponse<Wishlist>);
    }
  }

  updateWishlistItem(productId: string, update: UpdateWishlistItemRequest): Observable<ApiResponse<Wishlist>> {
    return this.http.put<ApiResponse<Wishlist>>(`${this.baseUrl}/item/${productId}`, update)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.wishlistSubject.next(response.data);
            this.updateWishlistSummary(response.data);
          }
        })
      );
  }

  clearWishlist(): Observable<ApiResponse<any>> {
    if (this.authService.isAuthenticated) {
      return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/clear`)
        .pipe(
          tap(response => {
            if (response.success) {
              this.wishlistSubject.next(null);
              this.wishlistSummarySubject.next({ itemCount: 0, hasItems: false });
            }
          })
        );
    } else {
      // Clear guest wishlist
      this.clearGuestWishlist();
      
      // Return a mock response for consistency
      return of({
        success: true,
        message: 'Wishlist cleared',
        data: null
      } as ApiResponse<any>);
    }
  }

  isInWishlist(productId: string): boolean {
    if (this.authService.isAuthenticated) {
      const currentWishlist = this.wishlistSubject.value;
      return currentWishlist?.items.some(item => item.productId._id === productId) || false;
    } else {
      const guestWishlist = this.getGuestWishlist();
      return guestWishlist.some(item => item.productId === productId);
    }
  }

  private updateWishlistSummary(wishlist: Wishlist) {
    const itemCount = wishlist.items.length;
    this.wishlistSummarySubject.next({
      itemCount,
      hasItems: itemCount > 0
    });
  }

  get currentWishlist(): Wishlist | null {
    return this.wishlistSubject.value;
  }

  get wishlistSummary(): WishlistSummary {
    return this.wishlistSummarySubject.value;
  }

  // Guest wishlist management
  private getGuestWishlist(): GuestWishlistItem[] {
    const wishlistJson = localStorage.getItem(this.guestWishlistKey);
    return wishlistJson ? JSON.parse(wishlistJson) : [];
  }

  private saveGuestWishlist(wishlist: GuestWishlistItem[]) {
    localStorage.setItem(this.guestWishlistKey, JSON.stringify(wishlist));
    this.updateGuestWishlistSummary(wishlist);
  }

  private updateGuestWishlistSummary(wishlist: GuestWishlistItem[]) {
    const itemCount = wishlist.length;
    this.wishlistSummarySubject.next({
      itemCount,
      hasItems: itemCount > 0
    });
  }

  private loadGuestWishlist() {
    if (!this.authService.isAuthenticated) {
      const guestWishlist = this.getGuestWishlist();
      this.updateGuestWishlistSummary(guestWishlist);
    }
  }

  addToGuestWishlist(productId: string, notes?: string) {
    const guestWishlist = this.getGuestWishlist();
    const existingItem = guestWishlist.find(item => item.productId === productId);
    
    if (!existingItem) {
      guestWishlist.push({ 
        productId, 
        addedAt: new Date(),
        notes 
      });
      this.saveGuestWishlist(guestWishlist);
    }
  }

  removeFromGuestWishlist(productId: string) {
    const guestWishlist = this.getGuestWishlist().filter(item => item.productId !== productId);
    this.saveGuestWishlist(guestWishlist);
  }

  updateGuestWishlistNotes(productId: string, notes?: string) {
    const guestWishlist = this.getGuestWishlist();
    const item = guestWishlist.find(item => item.productId === productId);
    
    if (item) {
      item.notes = notes;
      this.saveGuestWishlist(guestWishlist);
    }
  }

  clearGuestWishlist() {
    localStorage.removeItem(this.guestWishlistKey);
    this.wishlistSummarySubject.next({ itemCount: 0, hasItems: false });
  }

  private mergeGuestWishlistWithUserWishlist() {
    const guestWishlist = this.getGuestWishlist();
    
    if (guestWishlist.length > 0 && this.authService.isAuthenticated) {
      console.log('Merging guest wishlist with user wishlist...');
      
      // Get current user wishlist first to avoid duplicates
      this.getWishlist().subscribe({
        next: (response) => {
          const userWishlist = response.data;
          const existingProductIds = new Set(userWishlist?.items.map(item => item.productId._id) || []);
          
          // Filter out items that already exist in user wishlist
          const itemsToMerge = guestWishlist.filter(guestItem => 
            !existingProductIds.has(guestItem.productId)
          );
          
          if (itemsToMerge.length > 0) {
            // Convert guest wishlist items to API calls, handling failures individually
            const mergePromises = itemsToMerge.map(item => 
              this.http.post<ApiResponse<Wishlist>>(`${this.baseUrl}/add`, {
                productId: item.productId,
                notes: item.notes
              }).toPromise()
                .catch(error => {
                  console.warn(`Failed to merge wishlist item ${item.productId}:`, error);
                  return null; // Return null for failed items
                })
            );

            Promise.all(mergePromises).then((results) => {
              const successfulMerges = results.filter(result => result !== null);
              console.log(`Successfully merged ${successfulMerges.length} of ${itemsToMerge.length} new guest wishlist items`);
              
              // Always clear guest wishlist after merge attempt
              this.clearGuestWishlist();
              // Reload user wishlist
              this.getWishlist().subscribe();
            }).catch(error => {
              console.error('Error merging guest wishlist:', error);
              // Clear guest wishlist even on error to prevent repeated failures
              this.clearGuestWishlist();
            });
          } else {
            console.log('No new items to merge - all guest wishlist items already exist in user wishlist');
            // Clear guest wishlist since no new items to add
            this.clearGuestWishlist();
          }
        },
        error: (error) => {
          console.error('Error getting user wishlist for merge:', error);
          // Clear guest wishlist to prevent repeated failures
          this.clearGuestWishlist();
        }
      });
    }
  }

  getGuestWishlistCount(): number {
    const guestWishlist = this.getGuestWishlist();
    return guestWishlist.length;
  }

  // Utility method to toggle wishlist status
  toggleWishlist(product: Product): Observable<ApiResponse<Wishlist>> {
    if (this.isInWishlist(product._id)) {
      return this.removeFromWishlist(product._id);
    } else {
      return this.addToWishlist(product);
    }
  }

  // Method to move item from wishlist to cart (if cart service is available)
  moveToCart(productId: string, quantity: number = 1): Observable<any> {
    // This would require injecting CartService
    // Implementation depends on your cart service structure
    return this.removeFromWishlist(productId);
  }
}