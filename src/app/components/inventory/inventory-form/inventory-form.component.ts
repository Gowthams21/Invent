import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../../services/inventory.service';
import { SupplierService } from '../../../services/supplier.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Supplier } from '../../../models/supplier.model';

@Component({
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.css']
})
export class InventoryFormComponent implements OnInit {
  inventoryForm: FormGroup;
  inventoryId: number | null = null;
  isEditMode = false;
  suppliers: Supplier[] = [];
  categories: string[] = ['Electronics', 'Furniture', 'Clothing'];

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private supplierService: SupplierService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.inventoryForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      supplier_id: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.inventoryId = +id;
        this.isEditMode = true;
        this.loadInventory();
      }
    });
  }

  loadSuppliers(): void {
    this.supplierService.getAll().subscribe({
      next: (response) => {
        this.suppliers = response.data || [];
        if (this.suppliers.length === 0) {
          this.snackBar.open('No suppliers available. Please add a supplier first.', 'Close', { duration: 3000 });
          this.inventoryForm.get('supplier_id')?.disable();
        }
      },
      error: () => {
        this.snackBar.open('Failed to load suppliers', 'Close', { duration: 3000 });
        this.inventoryForm.get('supplier_id')?.disable();
      }
    });
  }

  loadInventory(): void {
    if (this.inventoryId) {
      this.inventoryService.getById(this.inventoryId).subscribe({
        next: (response) => {
          this.inventoryForm.patchValue(response.data);
        },
        error: () => {
          this.snackBar.open('Failed to load inventory item', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onSubmit(): void {
    const quantity = this.inventoryForm.get('quantity')?.value;
    if (quantity < 0) {
      this.snackBar.open('Quantity cannot be negative', 'Close', { duration: 3000 });
      return;
    }

    if (this.inventoryForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    if (this.suppliers.length === 0) {
      this.snackBar.open('Cannot add inventory: No suppliers available', 'Close', { duration: 3000 });
      return;
    }

    const inventoryItem = this.inventoryForm.value;
    console.log('Submitting inventory item:', inventoryItem); // Debug log to check the payload

    if (this.isEditMode && this.inventoryId) {
      this.inventoryService.update(this.inventoryId, inventoryItem).subscribe({
        next: () => {
          this.snackBar.open('Inventory item updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/inventory']);
        },
        error: (error) => {
          console.error('Update error:', error); // Log the error details
          this.snackBar.open('Failed to update inventory item', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.inventoryService.create(inventoryItem).subscribe({
        next: () => {
          this.snackBar.open('Inventory item added successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/inventory']);
        },
        error: () => {
          this.snackBar.open('Failed to add inventory item', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/inventory']);
  }
}
