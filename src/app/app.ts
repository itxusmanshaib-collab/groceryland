import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { App as CapacitorApp } from '@capacitor/app';

import { Network } from '@capacitor/network';     // 
import { Dialog } from '@capacitor/dialog';       

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private touchStartX = 0;
  private touchStartY = 0;
  private swipeIgnore = false;
  private swipeStartTarget: HTMLElement | null = null;
  private readonly swipeThreshold = 60;

  private readonly tabs = ['/home', '/categories', '/brands'];

  constructor(private location: Location, private router: Router) {}

  async ngOnInit() {
    this.handleBackButton();
    this.checkInternet(); // ✅ ADD

    // Ensure each route starts at the top of the page
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    });
  }

  handleBackButton() {
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      const currentUrl = this.router.url;
      const isRootRoute = currentUrl === '/home' || currentUrl === '/categories' || currentUrl === '/brands';

      // If not on a root tab, try to navigate back in history.
      if (!isRootRoute) {
        if (canGoBack) {
          this.location.back();
          return;
        }

        // Fallback: if the router history is empty, send the user to home.
        this.router.navigateByUrl('/home');
        return;
      }

      // On root tabs, exit immediately on back press.
      CapacitorApp.exitApp();
    });
  }

  async checkInternet() {

    const status = await Network.getStatus();

    if (!status.connected) {
      await Dialog.alert({
        message: 'Please check your internet connection.'
      });

      CapacitorApp.exitApp();
    }

    Network.addListener('networkStatusChange', async (status) => {

      if (!status.connected) {

        await Dialog.alert({
          message: 'Please check your internet connection.'
        });

        CapacitorApp.exitApp();
      }

    });

  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    const target = event.target as HTMLElement;

    if (target.closest('header')) {
      this.swipeIgnore = true;
      return;
    }

    if (this.isInHorizontalScroll(target)) {
      this.swipeIgnore = true;
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    this.swipeStartTarget = target;
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.swipeIgnore = false;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    if (this.swipeIgnore) {
      this.swipeIgnore = false;
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    if (Math.abs(deltaX) < this.swipeThreshold) {
      return;
    }

    const currentIndex = this.getCurrentTabIndex();
    if (currentIndex === -1) {
      return;
    }

    if (deltaX > 0) {
      const prev = Math.max(0, currentIndex - 1);
      if (prev !== currentIndex) {
        this.router.navigateByUrl(this.tabs[prev]);
      }
    } else {
      const next = Math.min(this.tabs.length - 1, currentIndex + 1);
      if (next !== currentIndex) {
        this.router.navigateByUrl(this.tabs[next]);
      }
    }
  }

  private getCurrentTabIndex(): number {
    const raw = this.router.url.split('?')[0].split('#')[0];
    const path = raw.replace(/\/+$/, '');

    if (path === '/home') {
      return 0;
    }

    if (path === '/categories') {
      return 1;
    }

    if (path === '/brands') {
      return 2;
    }

    return -1;
  }

  private isInHorizontalScroll(el: HTMLElement | null): boolean {
    while (el) {
      const style = window.getComputedStyle(el);
      const overflowX = style.overflowX;
      if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }
}