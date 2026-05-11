import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BottomMenu } from '../bottom-menu/bottom-menu';
import { Header } from '../header/header';
import { BackendService } from '../services/backend.service';

@Component({
  selector: 'app-sub-categories',
  standalone: true,
  imports: [CommonModule, Header, BottomMenu],
  templateUrl: './sub-categories.html',
  styleUrl: './sub-categories.css',
})
export class SubCategories implements OnInit {
  private backend = inject(BackendService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly IMAGE_BASE_PATH = 'https://groceryland.store/content/images/categories/';

  parentId = signal<number>(0);
  parentName = signal<string>('Sub Categories');
  subCategories = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('parentId') || 0);
    this.parentId.set(id);

    const fromState = history.state?.categoryName;
    if (fromState) this.parentName.set(String(fromState));

    this.loadSubCategories();
  }

  loadSubCategories(): void {
    this.loading.set(true);
    const branchData = localStorage.getItem('SelectedBranch');

    let branchId = 1;
    if (branchData) {
      const parsedBranch = JSON.parse(branchData);
      branchId = Number(parsedBranch.ShopId || parsedBranch);
    }

    this.backend
      .getcategories(branchId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any[]) => {
          const data = res || [];
          const parent = data.find((cat) => Number(cat.CategoryId) === this.parentId());
          if (parent?.CategoryName && !history.state?.categoryName) {
            this.parentName.set(String(parent.CategoryName));
          }

          const children = data.filter(
            (cat) => Number(cat.ParentId) === this.parentId(),
          );
          this.subCategories.set(children);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error:', err);
          this.loading.set(false);
        },
      });
  }

  getCategoryImage(imageName: string): string {
    if (!imageName) return 'assets/no-image.png';
    const file = String(imageName).trim();
    if (file.startsWith('http') || file.startsWith('//')) return file;
    return `${this.IMAGE_BASE_PATH}${file}`;
  }

  openProducts(subCategory: any): void {
    this.router.navigate(['/category-products', subCategory.CategoryId], {
      state: { categoryName: subCategory.CategoryName },
    });
  }
}
