import { Component, EventEmitter, inject, OnInit, Output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BackendService } from '../services/backend.service';

@Component({
  selector: 'app-top-categories',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './top-categories.html',
  styleUrl: './top-categories.css',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class TopCategories implements OnInit {
  private backend = inject(BackendService);
  private router = inject(Router);

  readonly imageBaseUrl = 'https://sale-point.pk/content/images/categories/';

  @Output() loaded = new EventEmitter<void>();

  categories = signal<any[]>([]);
  loading = signal<boolean>(false);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    const branchId = Number(localStorage.getItem('SelectedBranch')) || 1;
    const cacheKey = `categories:${branchId}`;
    if (this.backend.hasCache(cacheKey)) {
      this.loading.set(false);
    } else {
      this.loading.set(true);
    }

    this.backend.getcategories(branchId).subscribe({
      next: (res) => {
        const data = res?.data ?? res ?? [];
        this.categories.set(data);
        this.loaded.emit();
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.loaded.emit();
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  getCategoryImage(category: any): string {
    const file = category?.Image; 
    if (!file) return 'assets/no-image.png';
    if (String(file).startsWith('http')) return file;
    
    return `${this.imageBaseUrl}${file}`;
  }

  selectCategory(category: any) {
    this.router.navigate(['/top-category', category?.CategoryId ?? ''], {
      state: { categoryName: category?.CategoryName ?? '' },
    });
  }
}