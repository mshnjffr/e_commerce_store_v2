import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-rating.component.html',
  styleUrls: ['./product-rating.component.css']
})
export class ProductRatingComponent {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() showCount: boolean = false;
  @Input() reviewCount: number = 0;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() interactive: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  stars: boolean[] = [];

  ngOnInit() {
    this.updateStars();
  }

  ngOnChanges() {
    this.updateStars();
  }

  private updateStars() {
    this.stars = [];
    const fullStars = Math.floor(this.rating);
    const hasHalfStar = this.rating % 1 !== 0;

    for (let i = 0; i < this.maxRating; i++) {
      if (i < fullStars) {
        this.stars.push(true);
      } else if (i === fullStars && hasHalfStar) {
        this.stars.push(true); // We'll handle half stars in template
      } else {
        this.stars.push(false);
      }
    }
  }

  onStarClick(index: number) {
    if (this.interactive) {
      const newRating = index + 1;
      this.rating = newRating;
      this.updateStars();
      this.ratingChange.emit(newRating);
    }
  }

  getStarClass(index: number): string {
    const baseClass = 'star';
    const sizeClass = `star-${this.size}`;
    const fullStars = Math.floor(this.rating);
    const hasHalfStar = this.rating % 1 !== 0;

    if (index < fullStars) {
      return `${baseClass} ${sizeClass} star-full`;
    } else if (index === fullStars && hasHalfStar) {
      return `${baseClass} ${sizeClass} star-half`;
    } else {
      return `${baseClass} ${sizeClass} star-empty`;
    }
  }
}
