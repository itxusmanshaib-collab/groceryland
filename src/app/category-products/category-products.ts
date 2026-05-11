import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BackendService } from '../services/backend.service';
import { CartService } from '../services/cart.service';

interface Product {
  id: number;
  title: string;
  thumbnail: string;
  price: number;
  discountPercentage: number;
  quantity?: number;
}

@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgOptimizedImage],
  templateUrl: './category-products.html',
})
export class CategoryProducts implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private backend = inject(BackendService);
  private cartService = inject(CartService);

  private readonly productImagePath = 'https://sale-point.pk/Content/ProductImages/';

  categoryName = signal<string>('');
  products = signal<any[]>([]);
  loading = signal<boolean>(false);
  cartItems: any[] = [];
  searchText = signal<string>('');

  filteredProducts = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    if (!term) return this.products();

    return this.products().filter((p) => String(p?.title ?? '').toLowerCase().includes(term));
  });

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

  private getProductImage(imageName: any): string {
    if (!imageName) return 'assets/no-image.png';
    const file = String(imageName).trim();
    if (file.startsWith('http')) return file;

    return `${this.productImagePath}${file}`;
  }

  // onProductImageError(event: Event, product: any) {
  //   const img = event.target as HTMLImageElement;
  //   img.src = 'assets/no-image.png';
  // }

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

  private extractList(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
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
        const list = this.extractList(res);
        const mapped = list.map((p: any) => ({
          id: Number(p?.ProductId ?? p?.id ?? 0),
          title: String(p?.ProductName ?? p?.title ?? p?.Name ?? ''),
          thumbnail: this.getProductImage(p?.Image ?? p?.ProductImage ?? p?.ImageName),
          image: this.getProductImage(p?.Image ?? p?.ProductImage ?? p?.ImageName),
          price: Number(p?.SalePrice ?? p?.Price ?? p?.price ?? 0),
          discountPercentage: Number(p?.Discount ?? p?.discountPercentage ?? 0),
        }));
        this.products.set(mapped);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load category products', err);
        this.products.set([]);
        this.loading.set(false);
      },
    });

  }


}
