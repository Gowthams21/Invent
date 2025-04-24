import { Component, OnInit, OnDestroy } from '@angular/core';
import { InventoryService } from '../../../services/inventory.service';
import { SupplierService } from '../../../services/supplier.service';
import { InventoryItem } from '../../../models/inventory-item.model';
import { Supplier } from '../../../models/supplier.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css']
})
export class InventoryListComponent implements OnInit, OnDestroy {
  inventoryItems: InventoryItem[] = [];
  suppliers: Supplier[] = [];
  displayedColumns: string[] = ['id', 'name', 'category', 'quantity', 'supplier', 'actions'];
  private destroy$ = new Subject<void>();

  constructor(
    private inventoryService: InventoryService,
    private supplierService: SupplierService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    console.log('InventoryListComponent constructor called'); // Debug log
  }

  ngOnInit(): void {
    console.log('InventoryListComponent initialized'); // Debug log
    this.loadInventory();
    this.loadSuppliers();
  }

  loadInventory(): void {
    console.log('Fetching inventory from:', this.inventoryService['apiUrl'] + '/inventory'); // Debug log
    this.inventoryService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Inventory Response:', response); // Debug log
        this.inventoryItems = response.data || [];
        console.log('Inventory Items:', this.inventoryItems); // Debug log
        if (this.inventoryItems.length === 0) {
          this.snackBar.open('No inventory items available', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error loading inventory:', error); // Debug log
        this.snackBar.open('Failed to load inventory', 'Close', { duration: 3000 });
      }
    });
  }

  loadSuppliers(): void {
    console.log('Fetching suppliers from:', this.supplierService['apiUrl'] + '/suppliers'); // Debug log
    this.supplierService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Suppliers Response:', response); // Debug log
        this.suppliers = response.data || [];
        console.log('Suppliers:', this.suppliers); // Debug log
      },
      error: (error) => {
        console.error('Error loading suppliers:', error); // Debug log
        this.snackBar.open('Failed to load suppliers', 'Close', { duration: 3000 });
      }
    });
  }

  getSupplierName(supplierId: number | null | undefined): string {
    if (!supplierId) return 'None';
    const supplier = this.suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown';
  }

  deleteItem(id: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.inventoryService.delete(id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.snackBar.open('Inventory item deleted', 'Close', { duration: 3000 });
          this.loadInventory();
        },
        error: () => {
          this.snackBar.open('Failed to delete item', 'Close', { duration: 3000 });
        }
      });
    }
  }

  editItem(id: number): void {
    this.router.navigate([`/inventory/edit/${id}`]);
  }

  applyFilter(filters: { category?: string; stock?: string }): void {
    console.log('Applying filters:', filters); // Debug log
    this.inventoryService.filter(filters.category, filters.stock).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Filter Response:', response); // Debug log
        this.inventoryItems = response.data || [];
        console.log('Filtered Inventory Items:', this.inventoryItems); // Debug log
      },
      error: (error) => {
        console.error('Error applying filters:', error); // Debug log
        this.snackBar.open('Failed to apply filters', 'Close', { duration: 3000 });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}