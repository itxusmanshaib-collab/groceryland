import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BackendService } from '../services/backend.service';
import { CartService } from '../services/cart.service';
import { finalize, timeout } from 'rxjs';

interface CheckoutCartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

@Component({
  selector: 'app-check-out',
  imports: [RouterLink, CommonModule],
  templateUrl: './check-out.html',
  styleUrl: './check-out.css',
})
export class CheckOut implements OnInit {
  showSuccessPopup = signal(false);
  customerName = '-';
  customerPhone = '-';
  customerAddress = '-';
  totalPrice = 0;
  isPlacingOrder = signal(false);
  errorMsg = signal('');
  private cartItems: CheckoutCartItem[] = [];

  constructor(
    private cartService: CartService,
    private backendService: BackendService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadCartSummary();
  }

  private loadProfile(): void {
    const profileRaw = localStorage.getItem('profile');
    const storedContact = localStorage.getItem('Contact');

    if (!profileRaw) {
      this.customerPhone = storedContact || '-';
      return;
    }

    try {
      const profile = JSON.parse(profileRaw);
      const firstName = String(profile?.FirstName ?? '').trim();
      const lastName = String(profile?.LastName ?? '').trim();
      const fullName = `${firstName} ${lastName}`.trim();

      this.customerName = fullName || '-';
      this.customerPhone = String(profile?.Contact ?? storedContact ?? '-').trim() || '-';
      this.customerAddress = String(profile?.Address ?? '-').trim() || '-';
    } catch {
      this.customerPhone = storedContact || '-';
    }
  }

  private loadCartSummary(): void {
    const rawCart = localStorage.getItem('my_cart');
    this.cartItems = rawCart ? JSON.parse(rawCart) : [];
    this.totalPrice = this.cartService.getTotal();
    console.log('Cart Items Loaded:', this.cartItems);
  }

  confirmOrder(note: string): void {
    if (this.isPlacingOrder() || this.showSuccessPopup()) return;

    this.errorMsg.set('');
    this.loadCartSummary();

    if (!this.cartItems.length) {
      this.errorMsg.set('Cart is empty. Please add items before placing an order.');
      return;
    }

    const userId = Number(localStorage.getItem('UserId') || 0);
    if (!userId) {
      this.errorMsg.set('Session expired. Please login again.');
      return;
    }

    const branchId = this.getBranchId();
    const specialInstructions = String(note || '').trim();

    const orderPayload = {
      UserId: userId,
      ShopId: branchId,
      Contact: this.customerPhone,
      Address: this.customerAddress,
      CustomerName: this.customerName,
      Remarks: specialInstructions,
      TotalAmount: this.totalPrice,
      Items: this.cartItems.map((item) => ({
        ProductId: item.id,
        ProductName: item.title,
        Qty: item.quantity,
        Quantity: item.quantity,
        Rate: item.price,
        Price: item.price,
        Amount: item.price * item.quantity,
      })),
    };

    console.log('Order Payload:', orderPayload); // ✅ Debug

    this.isPlacingOrder.set(true);
    this.backendService
      .postOrder(orderPayload)
      .pipe(
        timeout(15000),
        finalize(() => this.isPlacingOrder.set(false))
      )
      .subscribe({
        next: (res: any) => {
          this.saveOrderLocally(res, orderPayload, userId);
          this.cartService.clearCart();
          localStorage.removeItem('my_cart'); // Clear localStorage cart
          this.showSuccessPopup.set(true);
        },
        error: (err) => {
          console.error('Order place failed', err);
          this.errorMsg.set(
            err?.name === 'TimeoutError'
              ? 'Server response timeout. Please check internet and try again.'
              : err?.error?.message || 'Failed to place order. Please try again.'
          );
        },
      });
  }

  closePopup(): void {
    this.showSuccessPopup.set(false);
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  private saveOrderLocally(apiRes: any, payload: any, userId: number): void {
    const storageKey = this.getOrdersStorageKey(userId);
    const raw = localStorage.getItem(storageKey);
    const existing = raw ? JSON.parse(raw) : [];

    const newOrder = {
      OrderId: apiRes?.OrderId ?? apiRes?.data?.OrderId ?? Date.now(),
      UserId: userId,
      TotalAmount: payload.TotalAmount,
      Items: payload.Items,
      Status: apiRes?.Status ?? apiRes?.data?.Status ?? 'Pending',
      CreatedOn: apiRes?.CreatedOn ?? apiRes?.data?.CreatedOn ?? new Date().toISOString(),
    };

    const safeArray = Array.isArray(existing) ? existing : [];
    safeArray.unshift(newOrder);
    localStorage.setItem(storageKey, JSON.stringify(safeArray));
  }

  private getOrdersStorageKey(userId: number): string {
    return `my_orders_${userId}`;
  }

  private getBranchId(): number {
    const branchData = localStorage.getItem('SelectedBranch');
    if (!branchData) return 1;

    try {
      const parsedBranch = JSON.parse(branchData);
      return Number(parsedBranch?.ShopId || parsedBranch || 1);
    } catch {
      return Number(branchData || 1);
    }
  }
}