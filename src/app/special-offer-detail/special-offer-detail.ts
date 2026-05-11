import { CommonModule, Location, NgOptimizedImage } from '@angular/common'; 
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BackendService } from '../services/backend.service';

@Component({
  selector: 'app-special-offer-detail',
  standalone: true, 
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './special-offer-detail.html',
  styleUrl: './special-offer-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush, 
})
export class SpecialOfferDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private backend = inject(BackendService);
  private location = inject(Location);

  product = signal<any>(null);

  goBack() {
    this.location.back();
  }

  private normalizeProduct(product: any) {
    const id = Number(product?.ProductId ?? product?.id ?? 0);
    const title = String(product?.ProductName ?? product?.title ?? product?.Name ?? '');
    const thumbnail = this.getProductImage(
      product?.thumbnail ?? product?.image ?? product?.Image ?? product?.ProductImage ?? '',
    );
    const price = Number(product?.SalePrice ?? product?.price ?? product?.Price ?? 0);
    const discountPercentage = Number(product?.Discount ?? product?.discountPercentage ?? 0);

    return { id, title, thumbnail, price, discountPercentage };
  }

  ngOnInit() {
    const productFromState = history.state?.product;
    if (productFromState) {
      this.product.set(this.normalizeProduct(productFromState));
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const productId = Number(id);
    if (!productId) return;

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
        const offers = Array.isArray(res?.Offers) ? res.Offers : [];
        const products = Array.isArray(res?.Products) ? res.Products : [];
        const source = offers.length ? offers : products;

        const matched = source.find((p: any) =>
          Number(p?.ProductId ?? p?.id ?? 0) === productId
        );

        if (!matched) return;

        const mapped = {
          id: Number(matched?.ProductId ?? matched?.id ?? 0),
          title: String(matched?.ProductName ?? matched?.title ?? ''),
          thumbnail: this.getProductImage(matched?.Image ?? matched?.thumbnail ?? ''),
          price: Number(matched?.SalePrice ?? matched?.price ?? 0),
          discountPercentage: Number(matched?.Discount ?? matched?.discountPercentage ?? 0),
        };

        this.product.set(mapped);
      },
      error: (err) => {
        console.error('Failed to load special offer detail', err);
      }
    });
  }

  private getProductImage(imageName: string): string {
    if (!imageName) return 'assets/no-image.png';
    if (String(imageName).startsWith('http')) return imageName;
    return `${this.backend.baseUrl}/Content/ProductImages/${imageName}`;
  }
}
