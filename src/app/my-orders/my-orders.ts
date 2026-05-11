import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of, timeout } from 'rxjs';
import { BackendService } from '../services/backend.service';

interface OrderView {
  orderNo: string;
  amount: number;
  itemsCount: number;
  status: string;
  createdAt: Date | null;
  items: OrderItemView[];
}

interface OrderItemView {
  name: string;
  qty: number;
  price: number;
}

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [DatePipe],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrders implements OnInit {
  private backendService = inject(BackendService);
  private datePipe = inject(DatePipe);

  orders = signal<OrderView[]>([]);
  expandedOrderNo = signal<string | null>(null);
  isLoading = signal(true);
  errorMsg = signal('');

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('UserId') || 0);
    const contact = String(localStorage.getItem('Contact') || '').trim();
    const storageIdentity = this.resolveStorageIdentity(userId, contact);
    const cachedOrders = storageIdentity ? this.getCachedOrders(storageIdentity) : [];
    if (cachedOrders.length > 0) {
      this.orders.set(cachedOrders);
    }

    const identitiesToTry = this.getIdentitiesToTry(userId, contact);
    if (identitiesToTry.length === 0) {
      this.isLoading.set(false);
      if (cachedOrders.length === 0) {
        this.errorMsg.set('User not found. Please login again.');
      }
      return;
    }

    this.loadOrdersFromApi(identitiesToTry, storageIdentity || identitiesToTry[0]);
  }

  private loadOrdersFromApi(identities: string[], storageIdentity: string): void {
    const storageKey = this.getOrdersStorageKey(storageIdentity);
    this.tryLoadOrders(identities, 0, storageKey);
  }

  private tryLoadOrders(identities: string[], index: number, storageKey: string): void {
    if (index >= identities.length) {
      this.isLoading.set(false);
      if (this.orders().length === 0) {
        localStorage.removeItem(storageKey);
        this.errorMsg.set('Orders load nahi ho rahe. Please try again.');
      }
      return;
    }

    const identity = identities[index];
    this.backendService
      .getOrdersByIdentity(identity)
      .pipe(
        timeout(15000),
        catchError((error) => {
          console.error(`Failed to load orders by identity ${identity}:`, error);
          return of([]);
        }),
      )
      .subscribe((res: unknown) => {
        const source = this.extractOrdersArray(res);
        const mapped = source.map((item) => this.mapOrder(item));

        if (mapped.length > 0) {
          this.orders.set(mapped);
          localStorage.setItem(storageKey, JSON.stringify(mapped));
          this.errorMsg.set('');
          this.isLoading.set(false);
          return;
        }

        this.tryLoadOrders(identities, index + 1, storageKey);
      });
  }

  private extractOrdersArray(res: unknown): any[] {
    if (Array.isArray(res)) {
      return res;
    }

    if (res && typeof res === 'object') {
      const data = (res as any).data;
      const result = (res as any).result;
      if (Array.isArray(data)) return data;
      if (Array.isArray(result)) return result;
    }

    return [];
  }

  private getCachedOrders(identity: string): OrderView[] {
    const storageKey = this.getOrdersStorageKey(identity);
    const raw = localStorage.getItem(storageKey);

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.map((item: any) => this.mapOrder(item));
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    const legacyRaw = localStorage.getItem('my_orders');
    if (!legacyRaw) return [];

    try {
      const parsed = JSON.parse(legacyRaw);
      if (!Array.isArray(parsed)) return [];
      const numericUserId = Number(identity);
      const filtered =
        numericUserId > 0
          ? parsed.filter((item: any) => Number(item?.UserId ?? numericUserId) === numericUserId)
          : parsed;
      const mapped = filtered.map((item: any) => this.mapOrder(item));
      if (mapped.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(mapped));
        localStorage.removeItem('my_orders');
      }
      return mapped;
    } catch {
      localStorage.removeItem('my_orders');
      return [];
    }
  }

  private getOrdersStorageKey(identity: string): string {
    return `my_orders_${identity}`;
  }

  private getIdentitiesToTry(userId: number, contact: string): string[] {
    const ids: string[] = [];

    if (userId > 0) {
      ids.push(String(userId));
    }

    const normalizedContact = this.normalizeContact(contact);
    if (normalizedContact) {
      ids.push(normalizedContact);
      ids.push(contact.trim());
    }

    return ids.filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);
  }

  private resolveStorageIdentity(userId: number, contact: string): string {
    if (userId > 0) return String(userId);
    const normalizedContact = this.normalizeContact(contact);
    return normalizedContact || contact.trim();
  }

  private normalizeContact(contact: string): string {
    return String(contact || '').replace(/\D/g, '');
  }

  private mapOrder(item: any): OrderView {
    const orderNo = String(
      item?.OrderId ?? item?.OrderNo ?? item?.Id ?? item?.id ?? item?.orderId ?? '-',
    );

    const amount = Number(item?.TotalAmount ?? item?.Amount ?? item?.total ?? item?.amount ?? 0);

    const itemsList =
      item?.Items ?? item?.OrderItems ?? item?.orderItems ?? item?.products ?? item?.ProductDetails;

    const items = this.mapOrderItems(itemsList);

    const itemsCount = Array.isArray(itemsList)
      ? itemsList.reduce(
          (sum: number, p: any) => sum + Number(p?.Qty ?? p?.Quantity ?? p?.quantity ?? 1),
          0,
        )
      : Number(item?.ItemsCount ?? item?.ItemCount ?? item?.qty ?? item?.quantity ?? 1);

    const statusRaw = String(item?.Status ?? item?.OrderStatus ?? item?.status ?? 'Pending');
    const status = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();

    const createdRaw = item?.CreatedOn ?? item?.CreatedAt ?? item?.Date ?? item?.OrderDate;
    const createdAt = createdRaw ? new Date(createdRaw) : null;

    return {
      orderNo,
      amount,
      itemsCount: itemsCount > 0 ? itemsCount : 1,
      status,
      createdAt: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : null,
      items,
    };
  }

  private mapOrderItems(itemsList: any): OrderItemView[] {
    if (!Array.isArray(itemsList)) return [];

    return itemsList.map((p: any) => ({
      name: String(p?.ProductName ?? p?.Name ?? p?.title ?? p?.ItemName ?? 'Item'),
      qty: Number(p?.Qty ?? p?.Quantity ?? p?.quantity ?? 1),
      price: Number(p?.SalePrice ?? p?.Price ?? p?.price ?? p?.Amount ?? 0),
    }));
  }

  toggleOrderDetails(orderNo: string): void {
    this.expandedOrderNo.set(this.expandedOrderNo() === orderNo ? null : orderNo);
  }

  isOrderExpanded(orderNo: string): boolean {
    return this.expandedOrderNo() === orderNo;
  }

  formatDate(value: Date | null): string {
    if (!value) return '-';
    return this.datePipe.transform(value, 'EEEE, MMMM d, y h:mm a') || '-';
  }

  trackByOrderNo(_: number, item: OrderView): string {
    return item.orderNo;
  }
}
