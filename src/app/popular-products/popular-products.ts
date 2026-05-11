import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, computed, EventEmitter, inject, OnDestroy, Output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../services/cart.service';
import { BackendService } from '../services/backend.service';

interface Product {
  id: number;
  title: string;
  thumbnail: string;
  price: number;
  discountPercentage: number;
  quantity?: number;
}

@Component({
  selector: 'app-popular-products',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './popular-products.html',
  styleUrl: './popular-products.css',
})
export class PopularProducts implements OnDestroy {
  private router = inject(Router);
  private cartService = inject(CartService);
  private backend = inject(BackendService);
  @Output() loaded = new EventEmitter<void>();

  products = signal<Product[]>([]);
  searchText = signal<string>('');
  cartItems = signal<any[]>([]);
  private cartSub?: Subscription;

  ngOnInit() {
    this.cartSub = this.cartService.cart$.subscribe((items) => {
      this.cartItems.set(items);
    });

    const branchData = localStorage.getItem('SelectedBranch');
    let branchId = 1;
    if (branchData) {
      try {
        const parsed = JSON.parse(branchData);
        branchId = Number(parsed?.ShopId || parsed || 1);
      } catch {
        branchId = Number(branchData) || 1;
      }
    }

    this.backend.appHome(branchId).subscribe({
      next: (res: any) => {
        const source = Array.isArray(res?.Offers) && res.Offers.length
          ? res.Offers
          : (Array.isArray(res?.Products) ? res.Products : []);

        const mapped: Product[] = source.map((p: any) => ({
          id: Number(p?.ProductId ?? p?.id ?? 0),
          title: String(p?.ProductName ?? p?.title ?? ''),
          thumbnail: this.getProductImage(p?.Image ?? p?.thumbnail ?? ''),
          price: this.toBasePrice(
            Number(p?.SalePrice ?? p?.price ?? 0),
            Number(p?.Discount ?? p?.discountPercentage ?? 0)
          ),
          discountPercentage: Number(p?.Discount ?? p?.discountPercentage ?? 0),
        }));

        this.products.set(mapped);
        this.loaded.emit();
      },
      error: (err) => {
        console.error('Error fetching popular products:', err);
        this.loaded.emit();
      }
    });
  }

  ngOnDestroy() {
    this.cartSub?.unsubscribe();
  }

  filteredProducts = computed(() => {
    const term = this.searchText().toLowerCase();
    return this.products().filter((product) => product.title.toLowerCase().includes(term));
  });



  trackById(index: number, item: Product) {
    return item.id;
  }

  add(product: Product) {
    this.cartService.addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.thumbnail,
      quantity: 1,
    });
  }

  removeOne(product: Product) {
    this.cartService.decreaseQty(product.id);
  }

  getQty(productId: number) {
    const item = this.cartItems().find((i) => i.id === productId);
    return item ? item.quantity : 0;
  }

  viewProduct(product: Product) {
    this.router.navigate(['/special-offer-detail', product.id], {
      state: { product },
    });
  }

  cartCount = computed(() =>
    this.cartItems().reduce((t, i) => t + i.quantity, 0)
  );

  private getProductImage(imageName: string): string {
    if (!imageName) return 'assets/no-image.png';
    if (String(imageName).startsWith('http')) return imageName;
    return `${this.backend.baseUrl}/Content/ProductImages/${imageName}`;
  }

  private toBasePrice(salePrice: number, discountPercentage: number): number {
    const discount = Number(discountPercentage) || 0;
    const sale = Number(salePrice) || 0;
    if (discount <= 0 || discount >= 100) return sale;
    return Math.round(sale / (1 - discount / 100));
  }
}
