import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../../../services/inventory.service';
import { SupplierService } from '../../../services/supplier.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryItem } from '../../../models/inventory-item.model';
import { Supplier } from '../../../models/supplier.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.css']
})
export class InventoryFormComponent implements OnInit, OnDestroy {
  inventoryForm: FormGroup;
  suppliers: Supplier[] = [];
  isEditMode = false;
  itemId?: number;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.inventoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      category: ['', [Validators.required, Validators.maxLength(255)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      supplier_id: [null]
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.itemId = +params['id'];
        this.loadItem(this.itemId);
      }
    });
  }

  loadSuppliers(): void {
    this.supplierService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.suppliers = response.data; // Extract the `data` array
      },
      error: () => {
        this.snackBar.open('Failed to load suppliers', 'Close', { duration: 3000 });
      }
    });
  }

  loadItem(id: number): void {
    this.inventoryService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.inventoryForm.patchValue(response.data);
      },
      error: () => {
        this.snackBar.open('Failed to load item', 'Close', { duration: 3000 });
        this.router.navigate(['/inventory']);
      }
    });
  }

  onSubmit(): void {
    if (this.inventoryForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    const item: InventoryItem = this.inventoryForm.value;
    const request = this.isEditMode
      ? this.inventoryService.update(this.itemId!, item)
      : this.inventoryService.create(item);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open(this.isEditMode ? 'Item updated successfully' : 'Item created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/inventory']);
      },
      error: () => {
        this.snackBar.open('Failed to save item', 'Close', { duration: 3000 });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}