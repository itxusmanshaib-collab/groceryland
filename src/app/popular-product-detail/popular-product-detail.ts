import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-slider',
  imports:[NgOptimizedImage, CommonModule],
  standalone: true,
  templateUrl: './popular-product-detail.html',
})
export class Slider implements OnChanges, OnDestroy {
  @Input() slides: { image: string; alt: string }[] = [];
  currentSlide = 0;
  slideInterval: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['slides'] && this.slides.length > 0) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy() {
    clearInterval(this.slideInterval);
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.resetAutoSlide();
  }

  nextSlide() {
    if (!this.slides.length) return;
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  startAutoSlide() {
    clearInterval(this.slideInterval);
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  resetAutoSlide() {
    clearInterval(this.slideInterval);
    this.startAutoSlide();
  }
}