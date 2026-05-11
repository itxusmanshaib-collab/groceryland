import { Component, signal } from '@angular/core';
import { Header } from '../header/header';
import { TopCategories } from '../top-categories/top-categories';
import { SpecialOffers } from '../special-offers/special-offers';
import { PopularProducts } from '../popular-products/popular-products';
import { BottomMenu } from '../bottom-menu/bottom-menu';
import { BannerSlider } from '../banner-slider/banner-slider';

@Component({
  selector: 'app-home',
  imports: [Header, TopCategories, SpecialOffers, PopularProducts, BottomMenu, BannerSlider],
  templateUrl: './home.html',
  styleUrl: './home.css',
})

export class Home {
  private static hasLoadedOnce = false;

  isLoading = signal(!Home.hasLoadedOnce);
  
  private loadedComponents = new Set<string>();
  private totalComponents = 3; 

  onComponentLoaded(name: string) {
    this.loadedComponents.add(name);

    if (this.loadedComponents.size === this.totalComponents) {
      this.isLoading.set(false);
      Home.hasLoadedOnce = true;
    }
  }

}
