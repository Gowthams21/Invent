import { Component, OnInit, OnDestroy } from '@angular/core';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../models/supplier.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit, OnDestroy {
  suppliers: Supplier[] = [];
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'contact', 'actions'];
  private destroy$ = new Subject<void>();

  constructor(
    private supplierService: SupplierService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Suppliers Response:', response); // Debug log
        this.suppliers = response.data || [];
        if (this.suppliers.length === 0) {
          this.snackBar.open('No suppliers available', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error loading suppliers:', error); // Debug log
        this.snackBar.open('Failed to load suppliers', 'Close', { duration: 3000 });
      }
    });
  }

  deleteSupplier(id: number): void {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.delete(id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.snackBar.open('Supplier deleted', 'Close', { duration: 3000 });
          this.loadSuppliers();
        },
        error: () => {
          this.snackBar.open('Failed to delete supplier', 'Close', { duration: 3000 });
        }
      });
    }
  }

  editSupplier(id: number): void {
    this.router.navigate([`/suppliers/edit/${id}`]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}