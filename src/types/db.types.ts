import { RowDataPacket } from 'mysql2';

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  supplier_id: number | null;
  created_at: Date;
}

export interface Supplier {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  contact: string | null;
  created_at: Date;
}

export { RowDataPacket }; 