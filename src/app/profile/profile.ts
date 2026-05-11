import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Dialog } from '@capacitor/dialog';
import { BackendService } from '../services/backend.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  providers: [BackendService]
})
export class ProfileComponent implements OnInit {

  form!: FormGroup;
  UserId: any;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    private router: Router,
  ) {
    this.UserId = localStorage.getItem('UserId');

    this.form = this.fb.group({
      Contact: ['', [Validators.required]],
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      Address: ['', Validators.required],
    });
  }

  ngOnInit(): void {

    const profileData = localStorage.getItem('profile');
    if (profileData) {
      const parsed = JSON.parse(profileData);
      this.form.patchValue(parsed);
    }

    const storedContact = localStorage.getItem('Contact');
    if (storedContact) {
      this.form.patchValue({ Contact: storedContact });
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const obj = {
      ...this.form.value,
      UserId: this.UserId,
    };

    this.backendService.profile(obj).subscribe({
      next: async (res) => {
        // Save profile locally
        localStorage.setItem('profile', JSON.stringify(this.form.value));

        await Dialog.alert({
          title: 'Profile Saved',
          message: 'Your profile has been updated successfully.',
        });

        this.router.navigate(['/home']);
      },
      error: async (err) => {
        console.error('Profile Save Failed', err);
        await Dialog.alert({
          title: 'Save Failed',
          message: 'Failed to save profile. Please try again.',
        });
      },
      complete: () => {
        this.isSaving = false;
      },
    });
  }
}