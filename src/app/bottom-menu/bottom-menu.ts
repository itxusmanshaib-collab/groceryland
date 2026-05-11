import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subscription, filter } from 'rxjs';
import { CartService } from '../services/cart.service';
import { 
  faHome, 
  faSearch, 
  faShoppingCart, 
  faUser, 
  faHeart,
  faTag,
  faBars 
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-bottom-menu',
  imports: [CommonModule, FontAwesomeModule, RouterLink, RouterLinkActive],
  templateUrl: './bottom-menu.html',
  styleUrl: './bottom-menu.css',
})
export class BottomMenu implements OnDestroy {

  private cartService = inject(CartService);
  private router = inject(Router);

  private cartSub!: Subscription;
  private routeSub!: Subscription;

  cartCount = 0;

  // 👇 last header route
  lastHeaderRoute = '/home';

  // 👇 previous url
  previousUrl = '';

  constructor() {

    // cart count
    this.cartSub = this.cartService.cart$.subscribe((items) => {
      this.cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });

    // 👇 track navigation
    this.routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {

        const currentUrl = event.urlAfterRedirects;

        // save header routes
        if (
          this.previousUrl === '/home' ||
          this.previousUrl === '/categories' ||
          this.previousUrl === '/brands'
        ) {
          this.lastHeaderRoute = this.previousUrl;
        }

        this.previousUrl = currentUrl;

      });

  }

  goHome() {

  const route = localStorage.getItem('lastHeaderRoute') || '/home';

  this.router.navigateByUrl(route);

}

  isHomeActive() {
    const url = this.router.url;
    return url === '/home' || url === '/categories' || url === '/brands';
  }

  // icons
  faHome = faHome;
  faSearch = faSearch;
  faShoppingCart = faShoppingCart;
  faUser = faUser;
  faHeart = faHeart;
  faTag = faTag;
  faBars = faBars;

  ngOnDestroy() {
    this.cartSub.unsubscribe();
    this.routeSub.unsubscribe();
  }

}