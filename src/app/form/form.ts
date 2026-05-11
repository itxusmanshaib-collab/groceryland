// form.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="p-6 max-w-md mx-auto">
      <h2 class="text-2xl font-bold mb-4">Contact Form</h2>
      
      <form (ngSubmit)="onSubmit()" #contactForm="ngForm">
        <div class="mb-4">
          <label class="block mb-2 font-medium">Name:</label>
          <input type="text" [(ngModel)]="formData.name" name="name" required
                 class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>
        
        <div class="mb-4">
          <label class="block mb-2 font-medium">Email:</label>
          <input type="email" [(ngModel)]="formData.email" name="email" required
                 class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>
        
        <div class="mb-4">
          <label class="block mb-2 font-medium">Phone (Optional):</label>
          <input type="tel" [(ngModel)]="formData.phone" name="phone"
                 class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>
        
        <div class="mb-4">
          <label class="block mb-2 font-medium">Subject:</label>
          <input type="text" [(ngModel)]="formData.subject" name="subject"
                 class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>
        
        <div class="mb-4">
          <label class="block mb-2 font-medium">Message:</label>
          <textarea [(ngModel)]="formData.message" name="message" required
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500" rows="4"></textarea>
        </div>
        
        <button type="submit" 
                [disabled]="isLoading"
                class="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isLoading ? 'Sending...' : 'Submit' }}
        </button>
      </form>
      
      <!-- Success Message -->
      <div *ngIf="successMessage" class="mt-4 p-3 bg-green-100 text-green-700 rounded">
        {{ successMessage }}
      </div>
      
      <!-- Error Message -->
      <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-100 text-red-700 rounded">
        {{ errorMessage }}
      </div>
    </div>
  `
})
export class FormComponent {
  formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };
  
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  private EMAILJS_SERVICE_ID = 'service_dtzn1to';
  private EMAILJS_TEMPLATE_ID = 'template_1l5qtrk';
  private EMAILJS_PUBLIC_KEY = 'aHYyb_M9aTWrRxqGL';
  private WHATSAPP_NUMBER = '923056990128';

  constructor(private cdr: ChangeDetectorRef) {}

  onSubmit() {
    console.log('Form submitted');
    
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges(); // Force UI update
    
    console.log('Sending email...');

    const templateParams = {
      from_name: this.formData.name,
      from_email: this.formData.email,
      phone: this.formData.phone || 'Not provided',
      subject: this.formData.subject || 'No Subject',
      message: this.formData.message,
      date: new Date().toLocaleString(),
      to_email: 'itxusmanshaib@gmail.com'
    };

    emailjs.send(
      this.EMAILJS_SERVICE_ID,
      this.EMAILJS_TEMPLATE_ID,
      templateParams,
      this.EMAILJS_PUBLIC_KEY
    )
    .then((response) => {
      console.log('Email SUCCESS:', response);
      
      this.isLoading = false;
      this.resetForm();
      this.saveToLocal();
      this.successMessage = '✅ Message sent successfully! We will contact you soon.';
      this.errorMessage = '';
      
      this.cdr.detectChanges(); // Force UI update
      console.log('UI should show success now');
    })
    .catch((error) => {
      console.error('Email FAILED:', error);
      
      this.isLoading = false;
      this.errorMessage = '❌ Email failed. Opening WhatsApp...';
      this.successMessage = '';
      
      this.cdr.detectChanges(); // Force UI update
      
      // WhatsApp backup after 2 seconds
      setTimeout(() => {
        this.openWhatsApp();
        this.successMessage = '✅ WhatsApp opened! Please send the message there.';
        this.errorMessage = '';
        this.cdr.detectChanges(); // Force UI update
      }, 2000);
    });
  }

  private openWhatsApp(): void {
    const message = `*New Contact Form Submission*%0A%0A` +
                   `👤 *Name:* ${this.formData.name}%0A` +
                   `📧 *Email:* ${this.formData.email}%0A` +
                   `📱 *Phone:* ${this.formData.phone || 'N/A'}%0A` +
                   `📝 *Subject:* ${this.formData.subject || 'N/A'}%0A` +
                   `💬 *Message:* ${this.formData.message}%0A%0A` +
                   `🕐 *Time:* ${new Date().toLocaleString()}`;

    const whatsappUrl = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  private saveToLocal(): void {
    try {
      const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
      submissions.push({
        ...this.formData,
        timestamp: new Date().toISOString(),
        id: Date.now()
      });
      localStorage.setItem('formSubmissions', JSON.stringify(submissions));
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  }

  private resetForm(): void {
    this.formData = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
  }
}