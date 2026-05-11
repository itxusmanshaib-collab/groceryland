import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { BackendService } from '../services/backend.service';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-brand-products',
  imports: [RouterLink, CommonModule, NgOptimizedImage, FormsModule],
  templateUrl: './brand-products.html',
  styleUrl: './brand-products.css',
})
export class BrandProducts implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private backend = inject(BackendService);
  private cartService = inject(CartService);

  // readonly imageBaseUrl = 'https://sale-point.pk/Content/ProductImages/';
  readonly imageBaseUrl = 'https://sale-point.pk/Content/ProductImages/';


  brandName = signal<string>('');
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  cartItems: any[] = [];



  
  // 👇 search signal
  searchText = signal<string>('');

  // 👇 filtered products
  filteredProducts = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    if (!term) return this.products();

    return this.products().filter((p) =>
      String(p?.title ?? '')
        .toLowerCase()
        .includes(term),
    );
  });

  ngOnInit() {
    const categoryId = Number(this.route.snapshot.paramMap.get('id'));
    const selectedName = history.state?.categoryName ?? 'Products';
    this.brandName.set(selectedName);
    this.loadProducts(categoryId);

    this.cartService.cart$.subscribe((items) => {
      this.cartItems = items;
    });
  }

  private getProductImage(imageName: any): string {
    if (!imageName) return 'assets/no-image.png';
    const file = String(imageName).trim();
    if (file.startsWith('http')) return file;

    return `${this.imageBaseUrl}${file}`;
  }

  loadProducts(categoryId: number) {
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
        const list = Array.isArray(res) ? res : res?.data ?? res?.Data ?? [];
        const mapped = list.map((p: any) => ({
          id: Number(p?.ProductId ?? p?.id ?? 0),
          title: String(p?.ProductName ?? p?.title ?? p?.Name ?? ''),
          image: this.getProductImage(p?.Image ?? p?.ProductImage ?? p?.ImageName),
          price: Number(p?.SalePrice ?? p?.Price ?? p?.price ?? 0),
        }));
        this.products.set(mapped);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load brand products', err);
        this.products.set([]);
        this.loading.set(false);
      },
    });
  }

  add(product: Product) {
    this.cartService.addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
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
}
