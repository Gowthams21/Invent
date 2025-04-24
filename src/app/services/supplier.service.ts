import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getAll(): Observable<{ message: string; data: Supplier[] }> {
    return this.http.get<{ message: string; data: Supplier[] }>(`${this.apiUrl}/suppliers`);
  }

  getById(id: number): Observable<{ message: string; data: Supplier }> {
    return this.http.get<{ message: string; data: Supplier }>(`${this.apiUrl}/suppliers/${id}`);
  }

  create(supplier: Supplier): Observable<{ message: string; data: Supplier }> {
    return this.http.post<{ message: string; data: Supplier }>(`${this.apiUrl}/suppliers`, supplier);
  }

  update(id: number, supplier: Supplier): Observable<{ message: string; data: Supplier }> {
    return this.http.put<{ message: string; data: Supplier }>(`${this.apiUrl}/suppliers/${id}`, supplier);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/suppliers/${id}`);
  }
}