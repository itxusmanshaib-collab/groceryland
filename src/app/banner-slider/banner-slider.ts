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
      image: 'https://kimi-web-img.moonshot.cn/img/t4.ftcdn.net/7cb640427f7d6099824e4ffd070f24626c315cef.jpg', 
      alt: 'Technology Banner - Blue Abstract' 
    },
    { 
      image: 'https://kimi-web-img.moonshot.cn/img/img.freepik.com/93ea73c2e2e8c5fbf676a9650d301dacb47ee9e8.jpg', 
      alt: 'Futuristic Digital Technology' 
    },
    { 
      image: 'https://kimi-web-img.moonshot.cn/img/img.freepik.com/73d4cd34d17165ac160565ca940442fa7ca5df8e.jpg', 
      alt: 'Corporate Business Banner' 
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