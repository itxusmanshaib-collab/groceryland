import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';
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
  selector: 'app-top-category-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './top-category-products.html',
  styleUrl: './top-category-products.css',
})
export class TopCategoryProducts implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private backend = inject(BackendService);
  private cartService = inject(CartService);

  readonly imageBaseUrl = 'http://pos.bilalstore.net/Content/ProductImages/';

  categoryName = signal<string>('');
  products = signal<any[]>([]);
  loading = signal<boolean>(false);
  cartItems: any[] = [];
  allProducts = signal<any[]>([]);
  searchText = signal<string>('');

  ngOnInit() {
    const categoryParam =
      this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.paramMap.get('name') ?? '';
    const selectedName = history.state?.categoryName ?? 'Products';
    this.categoryName.set(selectedName);

    this.loadProducts(categoryParam);

    this.cartService.cart$.subscribe((items) => {
      this.cartItems = items;
    });
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

  viewProduct(product: Product) {
    this.router.navigate(['/special-offer-detail', product.id], {
      state: { product },
    });
  }

  get selectedCount(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  }

  onSearch(value: string) {

  this.searchText.set(value);

  const text = value.toLowerCase().trim();

  if (!text) {
    this.products.set(this.allProducts());
    return;
  }

  const filtered = this.allProducts().filter((p) =>
    p.title.toLowerCase().includes(text)
  );

  this.products.set(filtered);
}

  private getProductImage(product: any): string {
    const file = product?.Image ?? product?.ProductImage ?? product?.thumbnail;
    if (!file) return 'assets/no-image.png';

    const rawFile = String(file).trim();
    if (rawFile.startsWith('http')) return rawFile;

    return `${this.imageBaseUrl}${rawFile}`;
  }

  loadProducts(categoryParam: string) {
    const categoryId = Number(categoryParam);

    const cacheKey = `categoryProducts:${categoryId}`;
    if (this.backend.hasCache(cacheKey)) {
      this.loading.set(false);
    } else {
      this.loading.set(true);
    }

    if (!categoryId) {
      this.products.set([]);
      this.loading.set(false);
      return;
    }

    this.backend.getCategoryProducts(categoryId).subscribe({
      next: (res: any) => {
        // Data extraction
        const list = Array.isArray(res) ? res : (res?.data ?? res?.Data ?? []);

        const mapped = list.map((p: any) => ({
          id: Number(p?.ProductId ?? p?.id ?? 0),
          title: String(p?.ProductName ?? p?.title ?? ''),
          thumbnail: this.getProductImage(p),
          image: this.getProductImage(p),
          price: Number(p?.SalePrice ?? p?.Price ?? p?.price ?? 0),
          discountPercentage: Number(p?.Discount ?? p?.discountPercentage ?? 0),
        }));

        this.allProducts.set(mapped); // original list
        this.products.set(mapped);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load top category products', err);
        this.products.set([]);
        this.loading.set(false);
      },
    });
  }
}
