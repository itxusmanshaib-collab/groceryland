import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth-guard-guard';
import { Customer } from './customer/customer';

const protectedRoute = {
  canActivate: [AuthGuard],
};

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'login', loadComponent: () => import('./login/login').then((m) => m.Login) },
  { path: 'otp', loadComponent: () => import('./otp/otp').then((m) => m.Otp) },

  {
    path: 'home',
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  {
    path: 'all-products',
    loadComponent: () => import('./all-products/all-products').then((m) => m.AllProducts),
  },
  {path:'customer', component:Customer},
  {
    path: 'categories',
    loadComponent: () => import('./categories/categories').then((m) => m.Categories),
  },
  {
    path: 'brands',
    loadComponent: () => import('./brands/brands').then((m) => m.Brands),
  },
  {
    path: 'special-offer-detail/:id',
    loadComponent: () =>
      import('./special-offer-detail/special-offer-detail').then((m) => m.SpecialOfferDetail),
  },
  {
    path: 'search',
    loadComponent: () => import('./search/search').then((m) => m.Search),
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart').then((m) => m.Cart),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings').then((m) => m.Settings),
  },
  {
    path: 'category-products/:id',
    loadComponent: () =>
      import('./category-products/category-products').then((m) => m.CategoryProducts),
  },
  {
    path: 'sub-categories/:parentId',
    loadComponent: () =>
      import('./sub-categories/sub-categories').then((m) => m.SubCategories),
  },
  {
    path: 'brand/:id',
    loadComponent: () => import('./brand-products/brand-products').then((m) => m.BrandProducts),
  },
  {
    path: 'top-category/:id',
    loadComponent: () =>
      import('./top-category-products/top-category-products').then((m) => m.TopCategoryProducts),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./check-out/check-out').then((m) => m.CheckOut),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path:'order-history',
    loadComponent: () => import('./my-orders/my-orders').then((m) => m.MyOrders),
  },
  {
    path:'contact-us',
    loadComponent: () => import('./contact-us/contact-us').then((m) => m.ContactUs),
  },
  {
    path:'privacy-policy',
    loadComponent: () => import('./privacy-policy/privacy-policy').then((m) => m.PrivacyPolicy),
  },
  {
    path:'form',
    loadComponent: () => import('./form/form').then((m) => m.FormComponent),
  }
];
