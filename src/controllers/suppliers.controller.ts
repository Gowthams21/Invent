import { Request, Response } from 'express';
import pool from '../config/db';
import { Supplier, RowDataPacket } from '../types/db.types';

// Helper function to transform RowDataPacket to Supplier
const mapRowToSupplier = (row: RowDataPacket): Supplier => ({
  id: row.id as number,
  name: row.name as string,
  email: row.email as string | null,
  phone: row.phone as string | null,
  contact: row.contact as string | null,
  created_at: row.created_at ? new Date(row.created_at as string) : new Date(),
});

export const getAllSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM suppliers');
    const suppliers: Supplier[] = rows.map(mapRowToSupplier);
    res.json({ message: 'Suppliers retrieved successfully', data: suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM suppliers WHERE id = ?', [id]);
    const suppliers: Supplier[] = rows.map(mapRowToSupplier);

    if (suppliers.length === 0) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    res.json({ message: 'Supplier retrieved successfully', data: suppliers[0] });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
};

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, contactInfo } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (name.length > 255) {
      res.status(400).json({ error: 'Name cannot exceed 255 characters' });
      return;
    }
    if (email && email.length > 255) {
      res.status(400).json({ error: 'Email cannot exceed 255 characters' });
      return;
    }
    if (phone && phone.length > 255) {
      res.status(400).json({ error: 'Phone cannot exceed 255 characters' });
      return;
    }
    if (contactInfo && contactInfo.length > 255) {
      res.status(400).json({ error: 'Contact info cannot exceed 255 characters' });
      return;
    }

    const [result] = await pool.query<RowDataPacket[]>(
      'INSERT INTO suppliers (name, email, phone, contact) VALUES (?, ?, ?, ?)',
      [name, email ?? null, phone ?? null, contactInfo ?? null]
    );

    const [newRows] = await pool.query<RowDataPacket[]>('SELECT * FROM suppliers WHERE id = ?', [(result as any).insertId]);
    const newSupplier: Supplier = mapRowToSupplier(newRows[0]);

    res.status(201).json({ message: 'Supplier created successfully', data: newSupplier });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier', details: error });
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, contactInfo } = req.body;

    const [check] = await pool.query<RowDataPacket[]>('SELECT * FROM suppliers WHERE id = ?', [id]);
    const suppliers: Supplier[] = check.map(mapRowToSupplier);
    if (suppliers.length === 0) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (name.length > 255) {
      res.status(400).json({ error: 'Name cannot exceed 255 characters' });
      return;
    }
    if (email && email.length > 255) {
      res.status(400).json({ error: 'Email cannot exceed 255 characters' });
      return;
    }
    if (phone && phone.length > 255) {
      res.status(400).json({ error: 'Phone cannot exceed 255 characters' });
      return;
    }
    if (contactInfo && contactInfo.length > 255) {
      res.status(400).json({ error: 'Contact info cannot exceed 255 characters' });
      return;
    }

    await pool.query(
      'UPDATE suppliers SET name = ?, email = ?, phone = ?, contact = ? WHERE id = ?',
      [name, email ?? null, phone ?? null, contactInfo ?? null, id]
    );

    const [updatedRows] = await pool.query<RowDataPacket[]>('SELECT * FROM suppliers WHERE id = ?', [id]);
    const updatedSupplier: Supplier = mapRowToSupplier(updatedRows[0]);

    res.json({
      message: 'Supplier updated successfully',
      data: updatedSupplier,
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [check] = await pool.query<RowDataPacket[]>('SELECT * FROM suppliers WHERE id = ?', [id]);
    const suppliers: Supplier[] = check.map(mapRowToSupplier);
    if (suppliers.length === 0) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    await pool.query('UPDATE inventory SET supplier_id = NULL WHERE supplier_id = ?', [id]);
    await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
};