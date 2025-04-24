import { Request, Response } from 'express';
import pool from '../config/db';
import { InventoryItem, RowDataPacket } from '../types/db.types';
import { ResultSetHeader } from 'mysql2';

// Helper function to validate inventory data
const validateInventoryData = (data: {
  name?: string;
  category?: string;
  quantity?: unknown;
  supplier_id?: unknown;
}) => {
  const errors: string[] = [];

  if (!data.name) errors.push('Name is required');
  if (!data.category) errors.push('Category is required');
  if (data.name && data.name.length > 255) errors.push('Name cannot exceed 255 characters');
  if (data.category && data.category.length > 255) errors.push('Category cannot exceed 255 characters');
  if (data.quantity !== undefined && (isNaN(Number(data.quantity)) || Number(data.quantity) < 0)) {
    errors.push('Quantity must be a non-negative number');
  }
  if (data.supplier_id !== undefined && (isNaN(Number(data.supplier_id)) || Number(data.supplier_id) <= 0)) {
    errors.push('Supplier ID must be a positive number if provided');
  }

  return errors;
};

// Helper function to check if inventory item exists
const inventoryItemExists = async (id: string): Promise<boolean> => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT 1 FROM inventory WHERE id = ?', [id]);
  return rows.length > 0;
};

// Helper function to check if supplier exists
const supplierExists = async (supplier_id: number): Promise<boolean> => {
  if (!supplier_id) return true; // Allow null supplier_id
  const [rows] = await pool.query<RowDataPacket[]>('SELECT 1 FROM suppliers WHERE id = ?', [supplier_id]);
  return rows.length > 0;
};

// Helper function to check if inventory belongs to supplier
const inventoryBelongsToSupplier = async (inventory_id: string, supplier_id: number | null): Promise<boolean> => {
  if (!supplier_id) return true; // Skip check if no supplier_id
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT 1 FROM inventory WHERE id = ? AND supplier_id = ?',
    [inventory_id, supplier_id]
  );
  return rows.length > 0;
};

// Helper function to get supplier_id from body (optional) with safeguard
const getSupplierIdFromBody = (req: Request): number | null => {
  if (!req.body || typeof req.body !== 'object') return null; // Safeguard against undefined or non-object req.body
  const supplier_id = req.body.supplier_id;
  if (supplier_id === undefined || supplier_id === null) return null;
  if (isNaN(Number(supplier_id)) || Number(supplier_id) <= 0) return null;
  return Number(supplier_id);
};

export const getAllInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier_id = getSupplierIdFromBody(req);
    
    let query = 'SELECT * FROM inventory';
    const params: any[] = [];

    if (supplier_id !== null) {
      if (!(await supplierExists(supplier_id))) {
        res.status(400).json({ error: 'Supplier does not exist' });
        return;
      }
      query += ' WHERE supplier_id = ?';
      params.push(supplier_id);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    const inventory: InventoryItem[] = rows.map(row => ({
      id: row.id as number,
      name: row.name as string,
      category: row.category as string,
      quantity: row.quantity as number,
      supplier_id: row.supplier_id as number | null,
      created_at: row.created_at ? new Date(row.created_at as string) : new Date(),
    }));
    res.json({ message: 'Inventory retrieved successfully', data: inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

export const getInventoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supplier_id = getSupplierIdFromBody(req);

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM inventory WHERE id = ?', [id]);
    const inventory: InventoryItem[] = rows.map(row => ({
      id: row.id as number,
      name: row.name as string,
      category: row.category as string,
      quantity: row.quantity as number,
      supplier_id: row.supplier_id as number | null,
      created_at: row.created_at ? new Date(row.created_at as string) : new Date(),
    }));

    if (inventory.length === 0) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    if (supplier_id !== null && !(await inventoryBelongsToSupplier(id, supplier_id))) {
      res.status(403).json({ error: 'Inventory item does not belong to this supplier' });
      return;
    }

    res.json({ message: 'Inventory item retrieved successfully', data: inventory[0] });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
};

export const createInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, quantity } = req.body || {};
    const supplier_id = getSupplierIdFromBody(req);

    // Validate supplier_id if provided
    if (supplier_id !== null && !(await supplierExists(supplier_id))) {
      res.status(400).json({ error: 'Supplier does not exist' });
      return;
    }

    // Validate input
    const errors = validateInventoryData({ name, category, quantity, supplier_id });
    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO inventory (name, category, quantity, supplier_id) VALUES (?, ?, ?, ?)',
      [name, category, quantity ?? 0, supplier_id ?? null]
    );

    const newItem: InventoryItem = {
      id: result.insertId,
      name,
      category,
      quantity: quantity ?? 0,
      supplier_id: supplier_id ?? null,
      created_at: new Date(),
    };
    res.status(201).json({ message: 'Inventory item created successfully', data: newItem });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
};

export const updateInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, category, quantity } = req.body || {};
    const supplier_id = getSupplierIdFromBody(req);

    // Validate supplier_id if provided
    if (supplier_id !== null && !(await supplierExists(supplier_id))) {
      res.status(400).json({ error: 'Supplier does not exist' });
      return;
    }

    // Check if inventory item exists
    if (!(await inventoryItemExists(id))) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    // Check if inventory belongs to supplier (skip if supplier_id is null)
    if (supplier_id !== null && !(await inventoryBelongsToSupplier(id, supplier_id))) {
      res.status(403).json({ error: 'Inventory item does not belong to this supplier' });
      return;
    }

    // Validate input
    const errors = validateInventoryData({ name, category, quantity, supplier_id });
    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    await pool.query(
      'UPDATE inventory SET name = ?, category = ?, quantity = ?, supplier_id = ? WHERE id = ?',
      [name, category, quantity ?? 0, supplier_id ?? null, id]
    );

    res.json({
      message: 'Inventory item updated successfully',
      data: { id: Number(id), name, category, quantity: quantity ?? 0, supplier_id: supplier_id ?? null, created_at: new Date() },
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
};

export const deleteInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supplier_id = getSupplierIdFromBody(req);

    // Validate supplier_id if provided
    if (supplier_id !== null && !(await supplierExists(supplier_id))) {
      res.status(400).json({ error: 'Supplier does not exist' });
      return;
    }

    // Check if inventory item exists
    if (!(await inventoryItemExists(id))) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    // Check if inventory belongs to supplier (skip if supplier_id is null)
    if (supplier_id !== null && !(await inventoryBelongsToSupplier(id, supplier_id))) {
      res.status(403).json({ error: 'Inventory item does not belong to this supplier' });
      return;
    }

    await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
};

export const filterInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, stock } = req.query;
    const supplier_id = getSupplierIdFromBody(req);

    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params: any[] = [];

    if (supplier_id !== null) {
      if (!(await supplierExists(supplier_id))) {
        res.status(400).json({ error: 'Supplier does not exist' });
        return;
      }
      query += ' AND supplier_id = ?';
      params.push(supplier_id);
    }

    if (category) {
      if (typeof category !== 'string' || category.length > 255) {
        res.status(400).json({ error: 'Invalid category' });
        return;
      }
      query += ' AND category = ?';
      params.push(category);
    }

    if (stock) {
      if (stock === 'low') {
        query += ' AND quantity < 10';
      } else if (stock === 'out') {
        query += ' AND quantity = 0';
      } else if (stock === 'in') {
        query += ' AND quantity > 0';
      } else {
        res.status(400).json({ error: 'Invalid stock filter. Use low, out, or in' });
        return;
      }
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    const inventory: InventoryItem[] = rows.map(row => ({
      id: row.id as number,
      name: row.name as string,
      category: row.category as string,
      quantity: row.quantity as number,
      supplier_id: row.supplier_id as number | null,
      created_at: row.created_at ? new Date(row.created_at as string) : new Date(),
    }));
    res.json({ message: 'Inventory filtered successfully', data: inventory });
  } catch (error) {
    console.error('Error filtering inventory:', error);
    res.status(500).json({ error: 'Failed to filter inventory' });
  }
};