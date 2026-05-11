import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { BackendService } from '../services/backend.service';

interface Product {
  id: number;
  title: string;
  thumbnail: string;
  price: number;
  discountPercentage: number;
}

@Component({
  selector: 'app-special-offers',
  imports: [CommonModule, RouterLink],
  templateUrl: './special-offers.html',
  styleUrl: './special-offers.css',
})
export class SpecialOffers implements OnInit {
  categories = signal<Product[]>([]); 
  cartItems: any[] = [];

  private cartService = inject(CartService);
  private backend = inject(BackendService);

  @Output() loaded = new EventEmitter<void>();

  ngOnInit() {
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
        console.log('appHome response =>', res);
        const source = Array.isArray(res?.Offers) && res.Offers.length
          ? res.Offers
          : (Array.isArray(res?.Products) ? res.Products : []);

        const mapped: Product[] = source.map((p: any) => ({
          id: Number(p?.ProductId ?? p?.id ?? 0),
          title: String(p?.ProductName ?? p?.title ?? ''),
          thumbnail: this.getProductImage(p?.Image ?? p?.thumbnail ?? ''),
          price: Number(p?.SalePrice ?? p?.price ?? 0),
          discountPercentage: Number(p?.Discount ?? p?.discountPercentage ?? 0),
        }));

        this.categories.set(mapped);
        this.loaded.emit();
      },
      error: () => {
        this.categories.set([]);
        this.loaded.emit();
      },
    });

    this.cartService.cart$.subscribe((items) => {
      this.cartItems = items;
    });
  }

  private getProductImage(imageName: string): string {
    if (!imageName) return 'assets/no-image.png';
    if (String(imageName).startsWith('http')) return imageName;
    return `${this.backend.baseUrl}/Content/ProductImages/${imageName}`;
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
    const item = this.cartItems.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  }
}
