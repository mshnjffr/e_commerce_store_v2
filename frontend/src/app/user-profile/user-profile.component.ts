import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { OrderService } from '../services/order.service';
import { User, ChangePasswordRequest } from '../models/user.model';
import { Order } from '../models/order.model';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  orders: Order[] = [];
  
  activeTab = 'profile';
  isLoadingProfile = false;
  isLoadingPassword = false;
  isLoadingOrders = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private orderService: OrderService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || ''
        });
      }
    });

    this.loadOrders();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'orders') {
      this.loadOrders();
    }
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isLoadingProfile = true;
    const profileData = this.profileForm.value;

    this.authService.updateProfile(profileData).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Profile updated successfully!');
        }
        this.isLoadingProfile = false;
      },
      error: (error) => {
        console.error('Profile update error:', error);
        this.isLoadingProfile = false;
      }
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isLoadingPassword = true;
    const passwordData: ChangePasswordRequest = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.authService.changePassword(passwordData).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Password changed successfully!');
          this.passwordForm.reset();
        }
        this.isLoadingPassword = false;
      },
      error: (error) => {
        console.error('Password change error:', error);
        this.isLoadingPassword = false;
      }
    });
  }

  loadOrders() {
    this.isLoadingOrders = true;
    this.orderService.getUserOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders = response.data.items || [];
        }
        this.isLoadingOrders = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoadingOrders = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  getOrderStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'badge bg-warning';
      case 'processing': return 'badge bg-info';
      case 'shipped': return 'badge bg-primary';
      case 'delivered': return 'badge bg-success';
      case 'cancelled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}
