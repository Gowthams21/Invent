import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-inventory-filters',
  templateUrl: './inventory-filters.component.html',
  styleUrls: ['./inventory-filters.component.css']
})
export class InventoryFiltersComponent {
  @Output() filterChange = new EventEmitter<{ category?: string; stock?: string }>();

  onCategoryChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const category = input ? input.value : undefined;
    this.filterChange.emit({ category });
  }

  onStockChange(event: any): void {
    const stock = event.value || undefined;
    this.filterChange.emit({ stock });
  }
}