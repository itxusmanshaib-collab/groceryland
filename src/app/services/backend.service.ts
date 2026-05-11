import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BackendService {
  private http = inject(HttpClient);
  // baseUrl:string = 'https://groceryland.pk';
  baseUrl:string = 'https://sale-point.pk';


  private cache = new Map<string, Observable<any>>();

  private cachedGet<T>(key: string, request: Observable<T>): Observable<T> {
    if (!this.cache.has(key)) {
      const shared = request.pipe(shareReplay({ bufferSize: 1, refCount: true }));
      this.cache.set(key, shared);
    }
    return this.cache.get(key) as Observable<T>;
  }

  hasCache(key: string): boolean {
    return this.cache.has(key);
  }

  clearCache(key: string) {
    this.cache.delete(key);
  }

  login(data: any) {
    return this.http.post<any>(`${this.baseUrl}/sec/login/SendOtp`, data);
  }

  verifyOtp(data: any) {
    return this.http.post<any>(`${this.baseUrl}/sec/login/VerifyOtp`, data);
  }

 optscreen(obj:any){
   return this.http.post<any>(`${this.baseUrl}/sec/login/register`, obj);
 }

  profile(obj:any){
   return this.http.post<any>(`${this.baseUrl}/sec/user/update`, obj);
 }

 getProfile(userId: number) {
  return this.http.get<any>(`${this.baseUrl}/sec/user/${userId}`);
}
 branches(){
   return this.http.get<any>(`${this.baseUrl}/api/Shop`);
 }
appHome(branchId: number) {
  const key = `appHome:${branchId}`;
  return this.cachedGet(key, this.http.get<any>(`${this.baseUrl}/api/AppHome/${branchId}`));
}
getcategories(branchId: number) {
  const key = `categories:${branchId}`;
  return this.cachedGet(key, this.http.get<any>(`${this.baseUrl}/api/category/${branchId}`));
}

getBrands(branchId: number) {
  const key = `brands:${branchId}`;
  return this.cachedGet(key, this.http.get<any>(`${this.baseUrl}/api/category/${branchId}`));
}

  searchProducts(branchId: number,phrase: string) {
    return this.http.get<any>(`${this.baseUrl}/api/Product/search/${phrase}/${branchId}`);
  }
 
  placeIrder(data: any,) {
    return this.http.post<any>(`${this.baseUrl}/api/Order`,data);
  }

getCategoryProducts(categoryId: number) {
  const key = `categoryProducts:${categoryId}`;
  return this.cachedGet(key, this.http.get<any[]>(`${this.baseUrl}/api/Product/${categoryId}`));
}

 postOrder(obj: any) {
    return this.http.post(`${this.baseUrl}/api/Order`, obj);
  }

  getOrdersByIdentity(identity: number | string) {
    return this.http.get(`${this.baseUrl}/api/Order/GetUser/${encodeURIComponent(String(identity))}`);
  }

  getOrdersByUserId(userId: number) {
    return this.getOrdersByIdentity(userId);
  }



 
}
