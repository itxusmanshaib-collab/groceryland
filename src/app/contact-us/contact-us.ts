import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../header/header';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.css']  
})
export class ContactUs {

  constructor(private http: HttpClient) { }
  
  contactData = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  isSubmitting = false;
  showSuccess = false;
  showError = false;
  successMessage = '';
  errorMessage = '';
  
  onSubmit(form: any) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.showSuccess = false;
    this.showError = false;

    // Only HTTP post - Remove setTimeout
    this.http.post('https://assetzmart.store/contact', this.contactData)
      .subscribe({
        next: (response) => {
          console.log('Form submitted successfully:', response);
          this.showSuccess = true;
          this.successMessage = 'Thank you for contacting us! We will get back to you soon.';
          this.resetForm(form);
          this.isSubmitting = false;
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            this.showSuccess = false;
          }, 5000);
        },
        error: (error) => {
          console.error('Error submitting form:', error);
          this.showError = true;
          
          if (error.status === 0) {
            this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else if (error.status === 400) {
            this.errorMessage = 'Bad request. Please check your information and try again.';
          } else if (error.status === 404) {
            this.errorMessage = 'Service not found. Please try again later.';
          } else {
            this.errorMessage = 'Something went wrong. Please try again later.';
          }
          
          this.isSubmitting = false;
          
          setTimeout(() => {
            this.showError = false;
          }, 1000);
        }
      });
  }

  resetForm(form: any) {
    this.contactData = {
      name: '',
      email: '',
      phone: '',
      message: ''
    };
    form.resetForm();
  }
}