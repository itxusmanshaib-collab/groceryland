import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-slider.html'
})
export class BannerSlider implements OnInit, OnDestroy {

slides = [
  { 
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80', 
    alt: 'Bilal Store - Quality Household Products' 
  },
  { 
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=1200&q=80', 
    alt: 'Bilal Store - Bakery and Fresh Items' 
  },
  { 
    image: 'https://images.unsplash.com/photo-1628102422617-3c520291717a?auto=format&fit=crop&w=1200&q=80', 
    alt: 'Bilal Store - Snacks and Beverages' 
  }
];
  currentSlide = 0;
  private interval: any;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  startAutoSlide() {
    this.interval = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.resetAutoSlide();
  }

  resetAutoSlide() {
    clearInterval(this.interval);
    this.startAutoSlide();
  }

  getSliderTransform(): string {
    return `translateX(-${this.currentSlide * 100}%)`;
  }
}