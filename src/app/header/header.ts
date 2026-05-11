import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isMobileMenuOpen = false;

  setHeaderRoute(route: string) {
    localStorage.setItem('lastHeaderRoute', route);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenuAndSetRoute(route: string) {
    this.setHeaderRoute(route);
    this.isMobileMenuOpen = false;
  }
}