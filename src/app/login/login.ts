import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of, switchMap, throwError, timeout } from 'rxjs';
import { BackendService } from '../services/backend.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {
  form: FormGroup;
  isLoading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^\s*03\d{9}\s*$/)]],
      hash: [''],
    });
  }

  ngOnInit() {
    const isLoggedIn = !!localStorage.getItem('AuthToken');
    const otpVerified = !!localStorage.getItem('OtpVerified');

    // If user is fully logged in, skip login.
    if (isLoggedIn && otpVerified) {
      this.router.navigate(['/home'], { replaceUrl: true });
      return;
    }

    // If the user is mid-login (has token but not verified), keep them on the login page
    // so they can correct the phone number if needed.
    const storedPhone = String(localStorage.getItem('OtpPhone') || localStorage.getItem('Contact') || '').trim();
    if (storedPhone) {
      this.form.patchValue({ phone: storedPhone });
    }
  }

  sendOtp() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const phone = String(this.form.value.phone ?? '').trim();
    const hash = this.form.value.hash;
    const payload: any = { phone };
    if (hash) {
      payload.hash = hash;
    }

    this.errorMsg = '';
    this.isLoading = true;

    this.backendService
      .login(payload)
      .pipe(
        timeout(15000),
        switchMap((res: any) => {
          const authToken = String(res?.token || 'dummy_token');
          localStorage.setItem('AuthToken', authToken);

          const loginData = res?.data ?? res;
          const loginUserId = Number(loginData?.UserId ?? loginData?.userId ?? 0);
          const tokenUserId = this.extractUserIdFromToken(authToken);
          const resolvedUserId = loginUserId > 0 ? loginUserId : tokenUserId;
          const loginContact = String(loginData?.Contact ?? loginData?.phone ?? phone).trim();

          // If backend already knows this user, do not call register again.
          if (resolvedUserId > 0) {
            const existingProfile = {
              ...(typeof loginData === 'object' && loginData ? loginData : {}),
              UserName: loginData?.UserName ?? phone,
              Contact: loginContact || phone,
              UserId: resolvedUserId,
            };
            return of({ data: existingProfile });
          }

          const obj = {
            UserName: phone,
            FirstName: '@',
            LastName: '',
            Contact: phone,
            Role: { Name: 'Mobile' },
            Password: 1234567,
          };

          return this.backendService.optscreen(obj).pipe(timeout(15000));
        }),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError((err) => {
          console.error('Login/Register failed', err);
          this.errorMsg = 'Server not responsed. Please try again.';
          return throwError(() => err);
        }),
      )
      .subscribe({
        next: (registerRes) => {
          const profile = registerRes?.data;
          const contact = registerRes?.data?.Contact ?? phone;
          const userIdFromProfile = Number(registerRes?.data?.UserId ?? 0);
          const userIdFromToken = this.extractUserIdFromToken(localStorage.getItem('AuthToken'));
          const userId = userIdFromProfile > 0 ? userIdFromProfile : userIdFromToken;

          const prevContact = String(localStorage.getItem('Contact') ?? '').trim();
          const prevUserId = Number(localStorage.getItem('UserId') ?? 0);

          if (profile) localStorage.setItem('profile', JSON.stringify(profile));
          localStorage.setItem('Contact', String(contact));
          if (userId > 0) {
            localStorage.setItem('UserId', String(userId));
          }
          localStorage.setItem('OtpPhone', String(contact).trim() || phone);
          localStorage.setItem('OtpNeedsProfile', registerRes?.data?.FirstName === '@' ? '1' : '0');

          const isDifferentUser =
            (prevUserId > 0 && userId > 0 && prevUserId !== userId) ||
            (prevContact && String(contact).trim() && prevContact !== String(contact).trim());

          if (isDifferentUser) {
            localStorage.removeItem('my_cart');
            localStorage.removeItem('cartItems');
          }

          this.router.navigate(['/otp'], { replaceUrl: true });
        },
      });
  }

  private extractUserIdFromToken(token: string | null | undefined): number {
    if (!token) return 0;

    try {
      const parts = token.split('.');
      if (parts.length < 2) return 0;

      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
      const decoded = atob(padded);
      const data = JSON.parse(decoded);

      const raw =
        data?.UserId ??
        data?.userId ??
        data?.sub ??
        data?.nameid ??
        data?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

      const id = Number(raw);
      return id > 0 ? id : 0;
    } catch {
      return 0;
    }
  }
}
