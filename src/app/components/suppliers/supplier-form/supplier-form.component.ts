import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Supplier } from '../../../models/supplier.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.css']
})
export class SupplierFormComponent implements OnInit, OnDestroy {
  supplierForm: FormGroup;
  isEditMode = false;
  supplierId?: number;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.supplierForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.maxLength(255)]],
      phone: ['', [Validators.maxLength(255)]],
      contact: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.supplierId = +params['id'];
        this.loadSupplier(this.supplierId);
      }
    });
  }

  loadSupplier(id: number): void {
    this.supplierService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.supplierForm.patchValue(data);
      },
      error: () => {
        this.snackBar.open('Failed to load supplier', 'Close', { duration: 3000 });
        this.router.navigate(['/suppliers']);
      }
    });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    const supplier: Supplier = this.supplierForm.value;
    const request = this.isEditMode
      ? this.supplierService.update(this.supplierId!, supplier)
      : this.supplierService.create(supplier);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open(this.isEditMode ? 'Supplier updated successfully' : 'Supplier created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/suppliers']);
      },
      error: () => {
        this.snackBar.open('Failed to save supplier', 'Close', { duration: 3000 });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}