import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.html',
})
export class Customer {
  constructor(private http: HttpClient) {}

  saveCustomer() {
    const customerData = {
      FirstName: 'Usman',
      LastName: 'Ali',
      PhoneNo: '03016815475',
      Email: 'itxusmanshaib@gmail.com',
      Address: 'kasur\nok',
      ShopId: 1,
      POS_CustomerDetails: [],
    };

    const formData = new FormData();

    formData.append('Customer', JSON.stringify(customerData));

    this.http.post('http://pos.bilalstore.net//api/customer/save', formData).subscribe({
      next: (res) => {
        console.log('Customer saved successfully', res);
        alert('Customer saved successfully!');
      },
      error: (err) => {
        console.error('Error saving customer', err);
      },
    });
  }
}
