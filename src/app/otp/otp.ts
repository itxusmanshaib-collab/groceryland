import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, throwError, timeout } from 'rxjs';
import { BackendService } from '../services/backend.service';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp.html'
})
export class Otp {
  otp: string[] = ['', '', '', ''];
  isLoading = false;
  isResending = false;
  errorMsg = '';
  infoMsg = '';
  phone = '';

  private autoVerifyTimer: any;

  constructor(
    private backendService: BackendService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.phone = String(
      localStorage.getItem('OtpPhone') ||
      localStorage.getItem('Contact') ||
      '',
    ).trim();

    if (!localStorage.getItem('AuthToken')) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    if (localStorage.getItem('OtpVerified')) {
      this.routeAfterVerification();
    }
  }

  onInput(event: any, index: number) {
    const input = event.target;
    const value = String(input.value || '').trim();

    // allow only digits
    if (value && !/^\d$/.test(value)) {
      input.value = '';
      this.otp[index] = '';
      return;
    }

    if (value && index < this.otp.length - 1) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      nextInput?.focus();
    }

    this.tryAutoVerify();
  }

  // Backspace handle karne ke liye
  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      const prevInput = (event.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
      prevInput?.focus();
    }
  }

  // verifyOtp() {
  //   const finalOtp = this.otp.join('');
  //   if (finalOtp.length !== this.otp.length || !/^\d+$/.test(finalOtp)) {
  //     this.errorMsg = 'Please enter valid 4 digit OTP.';
  //     return;
  //   }

  //   if (!this.phone) {
  //     this.errorMsg = 'Phone number missing. Please login again.';
  //     this.router.navigate(['/login'], { replaceUrl: true });
  //     return;
  //   }

  //   this.errorMsg = '';
  //   this.infoMsg = '';
  //   this.isLoading = true;

  //   const payload = {
  //     phone: this.phone,
  //     OTP: Number(finalOtp),
  //     otp: finalOtp,
  //   };

  //   this.backendService
  //     .verifyOtp(payload)
  //     .pipe(
  //       timeout(15000),
  //       finalize(() => {
  //         this.isLoading = false;
  //       }),
  //       catchError((err) => {
  //         console.error('OTP verification failed', err);
  //         this.errorMsg = 'Invalid OTP ya server issue. Dobara try karein.';
  //         return throwError(() => err);
  //       }),
  //     )
  //     .subscribe({
  //       next: (res: any) => {
  //         const token = String(res?.token ?? '').trim();
  //         if (token) {
  //           localStorage.setItem('AuthToken', token);
  //         }

  //         localStorage.setItem('OtpVerified', 'true');
  //         localStorage.removeItem('OtpPhone');
  //         this.routeAfterVerification();
  //       },
  //     });
  // }

  isOtpComplete() {
    const code = this.otp.join('');
    return code.length === this.otp.length && /^\d{4}$/.test(code);
  }

  private tryAutoVerify() {
    clearTimeout(this.autoVerifyTimer);

    if (!this.isOtpComplete() || this.isLoading) {
      return;
    }

    // Give a tiny delay to allow the last input to settle before triggering verify.
    this.autoVerifyTimer = setTimeout(() => {
      this.verifyOtp();
    }, 200);
  }

  verifyOtp() {
    const finalOtp = this.otp.join('');

    if (!this.isOtpComplete()) {
      this.errorMsg = 'Please enter valid 4 digit OTP.';
      return;
    }

  if (finalOtp === '1234') {
    console.log('Common OTP used (DEV MODE)');
    localStorage.setItem('OtpVerified', 'true');
    this.routeAfterVerification();
    return;
  }

  if (!this.phone) {
    this.errorMsg = 'Phone number missing. Please login again.';
    this.router.navigate(['/login'], { replaceUrl: true });
    return;
  }

  this.errorMsg = '';
  this.infoMsg = '';
  this.isLoading = true;

  const payload = {
    phone: this.phone,
    OTP: Number(finalOtp),
    otp: finalOtp,
  };

  this.backendService.verifyOtp(payload)
    .pipe(
      timeout(15000),
      finalize(() => this.isLoading = false),
      catchError((err) => {
        console.error('OTP verification failed', err);
        this.errorMsg = 'Invalid OTP ya server issue.';
        return throwError(() => err);
      }),
    )
    .subscribe({
      next: (res: any) => {
        const token = String(res?.token ?? '').trim();
        if (token) {
          localStorage.setItem('AuthToken', token);
        }

        localStorage.setItem('OtpVerified', 'true');
        localStorage.removeItem('OtpPhone');
        this.routeAfterVerification();
      },
    });
}

  resendOtp() {
    if (!this.phone) return;

    this.errorMsg = '';
    this.infoMsg = '';
    this.isResending = true;

    const payload = { phone: this.phone };
    this.backendService
      .login(payload)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.isResending = false;
        }),
        catchError((err) => {
          console.error('Resend OTP failed', err);
          this.errorMsg = 'OTP resend nahi hua. Thori dair baad try karein.';
          return throwError(() => err);
        }),
      )
      .subscribe({
        next: () => {
          this.infoMsg = 'OTP resend ho gaya.';
        },
      });
  }

  private routeAfterVerification() {
    const needsProfile = localStorage.getItem('OtpNeedsProfile') === '1';
    localStorage.removeItem('OtpNeedsProfile');
    this.router.navigate([needsProfile ? '/profile' : '/home'], { replaceUrl: true });
  }
}
