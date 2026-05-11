import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { BottomMenu } from '../bottom-menu/bottom-menu';
import { BackendService } from '../services/backend.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule, BottomMenu],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnDestroy {

  private backend = inject(BackendService);
  private cartService = inject(CartService);

  branchId = 1;
  searchPhrase = '';
  searchResults: any[] = [];
  cartItems: any[] = [];
  loading = false;

  private cartSub: Subscription;
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  constructor() {

    // cart update
    this.cartSub = this.cartService.cart$.subscribe((items) => {
      this.cartItems = items;
      this.searchResults = this.searchResults.map((product) => ({
        ...product,
        qty: this.getQty(product.id),
      }));
    });

    // search stream
    this.searchSub = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((phrase) => {
        this.loading = true;
        return this.backend.searchProducts(this.branchId, phrase);
      })
    ).subscribe({
      next: (res) => {
        const list = this.extractList(res);
        this.searchResults = list.map((p: any) => this.mapProduct(p));
        this.loading = false;
      },
      error: (error) => {
        console.error('Search failed', error);
        this.searchResults = [];
        this.loading = false;
      }
    });

  }

  onSearchChange(value: string) {

    this.searchPhrase = value;

    if (!value.trim()) {
      this.searchResults = [];
      this.loading = false;
      return;
    }

    this.searchSubject.next(value.trim());
  }

  onSearch() {
    const phrase = this.searchPhrase.trim();
    if (!phrase) return;

    this.searchSubject.next(phrase);
  }

  add(product: any) {

    this.cartService.addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    product.qty = this.getQty(product.id);
  }

  removeOne(product: any) {
    this.cartService.decreaseQty(product.id);
    product.qty = this.getQty(product.id);
  }

  getQty(productId: number) {
    const item = this.cartItems.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  }

  onProductImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/no-image.png';
  }

  ngOnDestroy() {
    this.cartSub.unsubscribe();
    this.searchSub?.unsubscribe();
  }

  private extractList(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.Data)) return res.Data;
    return [];
  }

  private mapProduct(p: any) {

    const id = Number(p?.ProductId ?? p?.id ?? 0);
    const title = String(p?.ProductName ?? p?.title ?? p?.Name ?? '');
    const image = this.getProductImage(p?.Image ?? p?.ProductImage ?? p?.ImageName);
    const price = Number(p?.SalePrice ?? p?.Price ?? p?.price ?? 0);

    return {
      id,
      title,
      image,
      price,
      qty: this.getQty(id),
    };
  }

  private getProductImage(imageName: any): string {

    if (!imageName) return 'assets/no-image.png';

    const file = String(imageName).trim();

    if (file.startsWith('http')) return file;

    return `${this.backend.baseUrl}/Content/ProductImages/${file}`;
  }

}