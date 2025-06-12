import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class LoadingService {
  private loadingCount = 0;
  private loading$ = new BehaviorSubject<boolean>(false);

  get isLoading$() {
    return this.loading$.asObservable();
  }

  show() {
    this.loadingCount++;
    if (this.loadingCount === 1) {
      this.loading$.next(true);
    }
  }

  hide() {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) {
      this.loading$.next(false);
    }
  }
}
