import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-gallery',
  imports: [CommonModule],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css'
})
export class ImageGalleryComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() alt: string = 'Product image';
  @Input() showThumbnails: boolean = true;
  @Input() showNavigation: boolean = true;
  @Input() autoPlay: boolean = false;
  @Input() autoPlayInterval: number = 3000;
  @Input() enableZoom: boolean = true;

  @ViewChild('mainImage', { static: false }) mainImageRef!: ElementRef<HTMLImageElement>;

  currentIndex = 0;
  isZoomed = false;
  zoomX = 0;
  zoomY = 0;
  isImageLoading = true;
  imageError = false;
  autoPlayTimer: any;

  get currentImage(): string {
    return this.images[this.currentIndex] || '';
  }

  get hasMultipleImages(): boolean {
    return this.images.length > 1;
  }

  ngOnInit() {
    if (this.autoPlay && this.hasMultipleImages) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  ngOnChanges() {
    if (this.currentIndex >= this.images.length) {
      this.currentIndex = 0;
    }
    this.resetImageState();
  }

  private resetImageState() {
    this.isImageLoading = true;
    this.imageError = false;
    this.isZoomed = false;
  }

  onImageLoad() {
    this.isImageLoading = false;
  }

  onImageError() {
    this.isImageLoading = false;
    this.imageError = true;
  }

  selectImage(index: number) {
    if (index >= 0 && index < this.images.length && index !== this.currentIndex) {
      this.currentIndex = index;
      this.resetImageState();
      this.restartAutoPlay();
    }
  }

  nextImage() {
    if (this.hasMultipleImages) {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.resetImageState();
      this.restartAutoPlay();
    }
  }

  previousImage() {
    if (this.hasMultipleImages) {
      this.currentIndex = this.currentIndex === 0 
        ? this.images.length - 1 
        : this.currentIndex - 1;
      this.resetImageState();
      this.restartAutoPlay();
    }
  }

  private startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      this.nextImage();
    }, this.autoPlayInterval);
  }

  private stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private restartAutoPlay() {
    if (this.autoPlay && this.hasMultipleImages) {
      this.startAutoPlay();
    }
  }

  toggleZoom() {
    if (this.enableZoom && !this.imageError) {
      this.isZoomed = !this.isZoomed;
      if (!this.isZoomed) {
        this.zoomX = 0;
        this.zoomY = 0;
      }
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isZoomed || !this.enableZoom || this.imageError) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.zoomX = (x / rect.width) * 100;
    this.zoomY = (y / rect.height) * 100;
  }

  onMouseLeave() {
    if (this.isZoomed) {
      this.isZoomed = false;
      this.zoomX = 0;
      this.zoomY = 0;
    }
  }

  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage();
        break;
      case 'Escape':
        event.preventDefault();
        if (this.isZoomed) {
          this.toggleZoom();
        }
        break;
    }
  }

  getThumbnailAlt(index: number): string {
    return `${this.alt} thumbnail ${index + 1}`;
  }

  getMainImageAlt(): string {
    return `${this.alt} ${this.currentIndex + 1} of ${this.images.length}`;
  }
}
