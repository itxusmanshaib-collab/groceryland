import { Component, inject, OnInit, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { Router } from '@angular/router';
import { BackendService } from '../services/backend.service';
import { BottomMenu } from '../bottom-menu/bottom-menu';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, Header, BottomMenu],
  templateUrl: './categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories implements OnInit {
  private backend = inject(BackendService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly IMAGE_BASE_PATH = 'https://groceryland.pk/content/images/categories/';

  allCategories = signal<any[]>([]);
  categories = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    const branchData = localStorage.getItem('SelectedBranch');

    let branchId = 1;
    if (branchData) {
      const parsedBranch = JSON.parse(branchData);
      branchId = Number(parsedBranch.ShopId || parsedBranch);
    }

    const cacheKey = `categories:${branchId}`;
    if (this.backend.hasCache(cacheKey)) {
      this.loading.set(false);
    } else {
      this.loading.set(true);
    }

    this.backend.getcategories(branchId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any[]) => {
          const data = res || [];
          this.allCategories.set(data);
          const parentCategories = data.filter((cat) => !cat.ParentId || Number(cat.ParentId) === 0);
          this.categories.set(parentCategories);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error:', err);
          this.loading.set(false);
        }
      });
  }

  getCategoryImage(imageName: string): string {
    if (!imageName) return 'assets/no-image.png';
    const file = String(imageName).trim();
    if (file.startsWith('http') || file.startsWith('//')) return file;
    return `${this.IMAGE_BASE_PATH}${file}`;
  }

  selectCategory(category: any) {
    if (this.hasSubCategories(category.CategoryId)) {
      this.router.navigate(['/sub-categories', category.CategoryId], {
        state: { categoryName: category.CategoryName },
      });
      return;
    }

    this.router.navigate(['/category-products', category.CategoryId], {
      state: { categoryName: category.CategoryName },
    });
  }

  getSubCategories(parentId: number): any[] {
    return this.allCategories().filter((cat) => Number(cat.ParentId) === Number(parentId));
  }

  hasSubCategories(parentId: number): boolean {
    return this.getSubCategories(parentId).length > 0;
  }
}
