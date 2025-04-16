import { RowDataPacket } from 'mysql2';

export interface InventoryItem extends RowDataPacket {
  id: number;
  name: string;
  category: string;
  quantity: number;
  supplier_id: number | null;
  created_at: Date;
}

export interface Supplier extends RowDataPacket {
  id: number;
  name: string;
  contact: string | null;
  created_at: Date;
}