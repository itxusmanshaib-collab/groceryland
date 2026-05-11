import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from "@angular/router";
import { BottomMenu } from '../bottom-menu/bottom-menu';

interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

@Component({
  imports: [CommonModule, NgOptimizedImage, RouterLink, BottomMenu],
  selector: 'app-cart',
  templateUrl: './cart.html'
})
export class Cart implements OnInit {

  cartItems: CartItem[] = [];
  totalPrice: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.cartService.getTotal();
    });
  }

  increase(id: number){
    this.cartService.increaseQty(id);
  }

  decrease(id: number){
    this.cartService.decreaseQty(id);
  }

  remove(id: number){
    this.cartService.removeItem(id);
  }

  clearCart(){
    this.cartService.clearCart();
  }
}