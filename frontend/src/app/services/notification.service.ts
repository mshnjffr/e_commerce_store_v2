import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  get notifications() {
    return this.notifications$.asObservable();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private addNotification(type: Notification['type'], message: string, duration = 5000) {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      duration
    };

    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }

  showSuccess(message: string, duration?: number) {
    this.addNotification('success', message, duration);
  }

  showError(message: string, duration?: number) {
    this.addNotification('error', message, duration);
  }

  showWarning(message: string, duration?: number) {
    this.addNotification('warning', message, duration);
  }

  showInfo(message: string, duration?: number) {
    this.addNotification('info', message, duration);
  }

  remove(id: string) {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter(n => n.id !== id));
  }

  clear() {
    this.notifications$.next([]);
  }
}
