import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';

interface Product {
  id: number;
  title: string;
  thumbnail: string;
  price: number;
  discountPercentage: number;
  quantity?: number;
}

interface ApiResponse {
  products: Product[];
}

@Component({
  selector: 'app-all-products',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage, RouterLink],
  templateUrl: './all-products.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllProducts implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  cartItems: any[] = [];

  products = signal<Product[]>([]);
  searchText = signal<string>('');

  ngOnInit() {
    const navProducts = history.state?.products as Product[] | undefined;
    const fromSpecialOffers = !!history.state?.fromSpecialOffers;

    if (Array.isArray(navProducts) && navProducts.length) {
      const initialProducts = navProducts.map((p) => ({
        ...p,
        // All-products UI computes discounted price from `price` and `discountPercentage`.
        // Special-offers data carries sale price, so convert back to base price for consistency.
        price: fromSpecialOffers ? this.toBasePrice(p.price, p.discountPercentage) : p.price,
        quantity: 0,
      }));
      this.products.set(initialProducts);
    // } else {
    //   this.http.get<ApiResponse>('https://dummyjson.com/products').subscribe((res) => {
    //     const initialProducts = res.products.map((p) => ({ ...p, quantity: 0 }));
    //     this.products.set(initialProducts);
    //   });
    }

     this.cartService.cart$.subscribe(items => {
    this.cartItems = items;
  });
  
  }

  filteredProducts = computed(() => {
    const term = this.searchText().toLowerCase();
    return this.products().filter((product) => product.title.toLowerCase().includes(term));
  });




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
  const item = this.cartItems.find(i => i.id === productId);
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

private toBasePrice(salePrice: number, discountPercentage: number): number {
  const discount = Number(discountPercentage) || 0;
  const sale = Number(salePrice) || 0;
  if (discount <= 0 || discount >= 100) return sale;
  return Math.round(sale / (1 - discount / 100));
}


  trackById(index: number, item: Product) {
    return item.id;
  }
}
