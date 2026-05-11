import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductCartService {
  private cartItems = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItems.asObservable();

  private productsMap = new Map<number, any>();
  private localStorageKey = 'cartItems';

  constructor() {
    this.loadCartFromStorage(); // Load from localStorage on service init
  }

  increment(product: any) {
    const existing = this.productsMap.get(product.ProductId);
    if (existing) {
      existing.qty += 1;
      product.qty = existing.qty;
    } else {
      const newProduct = { ...product, qty: 1 };
      this.productsMap.set(product.ProductId, newProduct);
      product.qty = 1;
    }
    this.updateCart();
  }

  decrement(product: any) {
    const existing = this.productsMap.get(product.ProductId);
    if (existing) {
      if (existing.qty > 1) {
        existing.qty -= 1;
        product.qty = existing.qty;
      } else {
        this.productsMap.delete(product.ProductId);
        product.qty = 0;
      }
      this.updateCart();
    }
  }

  getCartItems() {
    return Array.from(this.productsMap.values());
  }

  private updateCart(): void {
    const cart = this.getCartItems();
    this.cartItems.next(cart);
    this.saveCartToStorage(cart);
  }

  private saveCartToStorage(cart: any[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(cart));
  }

  private loadCartFromStorage(): void {
    const storedCart = localStorage.getItem(this.localStorageKey);
    if (storedCart) {
      const items: any[] = JSON.parse(storedCart);
      for (const item of items) {
        this.productsMap.set(item.ProductId, item);
      }
      this.cartItems.next(this.getCartItems());
    }
  }
removeItem(product: any): void {
  this.productsMap.delete(product.ProductId);
  this.updateCart();
}
getProductQty(productId: number): number {
  const item = this.productsMap.get(productId);
  return item ? item.qty : 0;
}
  clearCart(): void {
    this.productsMap.clear();
    this.updateCart();
    localStorage.removeItem(this.localStorageKey);
  }
}
