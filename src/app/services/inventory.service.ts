import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryItem } from '../models/inventory-item.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) { }

  getAll(): Observable<{ message: string; data: InventoryItem[] }> {
    return this.http.get<{ message: string; data: InventoryItem[] }>(`${this.apiUrl}/inventory`);
  }

  filter(category?: string, stock?: string): Observable<{ message: string; data: InventoryItem[] }> {
    let params: any = {};
    if (category) params.category = category;
    if (stock) params.stock = stock;
    return this.http.get<{ message: string; data: InventoryItem[] }>(`${this.apiUrl}/inventory/filter`, { params });
  }

  getById(id: number): Observable<{ message: string; data: InventoryItem }> {
    return this.http.get<{ message: string; data: InventoryItem }>(`${this.apiUrl}/inventory/${id}`);
  }

  create(item: InventoryItem): Observable<{ message: string; data: InventoryItem }> {
    return this.http.post<{ message: string; data: InventoryItem }>(`${this.apiUrl}/inventory`, item);
  }

  update(id: number, item: InventoryItem): Observable<{ message: string; data: InventoryItem }> {
    return this.http.put<{ message: string; data: InventoryItem }>(`${this.apiUrl}/inventory/${id}`, item);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/inventory/${id}`);
  }
}