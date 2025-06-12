import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { User } from '../models/user.model';
import { CartSummary } from '../models/cart.model';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  isAuthenticated = false;
  cartSummary: CartSummary = { itemCount: 0, totalAmount: 0 };

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.cartService.getCartCount().subscribe();
      } else {
        // For guest users, show guest cart count
        const guestCartCount = this.cartService.getGuestCartCount();
        this.cartSummary = { itemCount: guestCartCount, totalAmount: 0 };
      }
    });

    this.cartService.cartSummary$.subscribe(summary => {
      this.cartSummary = summary;
    });
  }

  logout() {
    this.authService.logout();
  }
}
