import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = !!localStorage.getItem('AuthToken');
    const otpVerified = !!localStorage.getItem('OtpVerified');

    if (isLoggedIn && otpVerified) {
      return true;
    }

    this.router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
}
