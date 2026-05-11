import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BottomMenu } from '../bottom-menu/bottom-menu';

@Component({
  selector: 'app-settings',
  imports: [BottomMenu],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings{
 constructor(private router: Router) {}
  home() {
   this.router.navigate(['/home']);
  }
   logout() {
  const keysToRemove = [
    'AuthToken',
    'OtpVerified',
    'SelectedBranch',
    'profile',
    'Contact',
    'UserId',
    'my_cart',
    'cartItems',
  ];
  keysToRemove.forEach((key) => localStorage.removeItem(key));
  Object.keys(localStorage)
    .filter((key) => key.startsWith('my_orders_'))
    .forEach((key) => localStorage.removeItem(key));
  this.router.navigate(['/login'], { replaceUrl: true });
}
profile(){
  this.router.navigate(['/profile']);
}
OrderHistory(){
  this.router.navigate(['/order-history']);
}
}
