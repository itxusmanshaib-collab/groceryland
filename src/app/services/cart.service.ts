import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private storageKey = 'my_cart';

  private cartSubject = new BehaviorSubject<CartItem[]>(this.getCart());
  cart$ = this.cartSubject.asObservable();

  constructor() {}

  private getCart(): CartItem[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveCart(cart: CartItem[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  addToCart(product: CartItem) {
    let cart = this.getCart();

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      product.quantity = 1;
      cart.push(product);
    }

    this.saveCart(cart);
  }

  removeItem(id: number) {
    let cart = this.getCart().filter(item => item.id !== id);
    this.saveCart(cart);
  }

  increaseQty(id: number) {
    let cart = this.getCart();
    const item = cart.find(i => i.id === id);
    if (item) item.quantity++;
    this.saveCart(cart);
  }

  decreaseQty(id: number) {
    let cart = this.getCart();
    const item = cart.find(i => i.id === id);

    if (!item) return;

    if (item.quantity > 1) {
      item.quantity--;
    } else {
      cart = cart.filter(i => i.id !== id);
    }

    this.saveCart(cart);
  }

  clearCart() {
    localStorage.removeItem(this.storageKey);
    this.cartSubject.next([]);
  }

  getTotal(): number {
    return this.getCart().reduce((total, item) =>
      total + item.price * item.quantity, 0);
  }
}