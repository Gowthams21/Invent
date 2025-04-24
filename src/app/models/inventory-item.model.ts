export interface InventoryItem {
    id?: number;
    name: string;
    category: string;
    quantity: number;
    supplier_id?: number | null;
    created_at?: Date;
  }