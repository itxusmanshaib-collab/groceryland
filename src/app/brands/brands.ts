import { Component, inject, OnInit, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { Router } from '@angular/router';
import { BackendService } from '../services/backend.service';
import { BottomMenu } from '../bottom-menu/bottom-menu';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule, Header, BottomMenu],
  templateUrl: './brands.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Brands implements OnInit {

  private backend = inject(BackendService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly IMAGE_BASE_PATH = 'https://sale-point.pk/content/images/categories/';

  brands = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadBrands();
  }

  loadBrands() {
    this.loading.set(true);

    const branchData = localStorage.getItem('SelectedBranch');

    let branchId = 1;
    if (branchData) {
      const parsedBranch = JSON.parse(branchData);
      branchId = Number(parsedBranch.ShopId || parsedBranch);
    }

    this.backend.getBrands(branchId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any[]) => {

          const allCategories = res || [];

          const parentIds = new Set(
            allCategories
              .map((cat) => Number(cat.ParentId))
              .filter((id) => id && id !== 0),
          );

          const brands = allCategories.filter(
            (cat) => !parentIds.has(Number(cat.CategoryId)),
          );

          this.brands.set(brands);

          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        }
      });
  }

  getBrandImage(imageName: string): string {
    if (!imageName) return 'assets/no-image.png';
    const file = String(imageName).trim();
    if (file.startsWith('http') || file.startsWith('//')) return file;
    return `${this.IMAGE_BASE_PATH}${file}`;
  }

  selectBrand(brand: any) {

    if (brand.CategoryId) {

      this.router.navigate(['/brand', brand.CategoryId], {
        state: { categoryName: brand.CategoryName }
      });

    }
  }

}