import { Request, Response } from 'express';
import pool from '../config/db';
import { Supplier } from '../types/db.types';

export const getAllSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<Supplier[]>('SELECT * FROM suppliers');
    res.json({ message: 'Suppliers retrieved successfully', data: rows });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<Supplier[]>('SELECT * FROM suppliers WHERE id = ?', [id]);

    if (rows.length === 0) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    res.json({ message: 'Supplier retrieved successfully', data: rows[0] });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
};

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, contact } = req.body;

    // Validation
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (name.length > 255) {
      res.status(400).json({ error: 'Name cannot exceed 255 characters' });
      return;
    }
    if (contact && contact.length > 255) {
      res.status(400).json({ error: 'Contact cannot exceed 255 characters' });
      return;
    }

    const [result] = await pool.query(
      'INSERT INTO suppliers (name, contact) VALUES (?, ?)',
      [name, contact ?? null]
    );

    const newSupplier = { id: (result as any).insertId, name, contact: contact ?? null };
    res.status(201).json({ message: 'Supplier created successfully', data: newSupplier });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, contact } = req.body;

    // Check if supplier exists
    const [check] = await pool.query<Supplier[]>('SELECT * FROM suppliers WHERE id = ?', [id]);
    if (check.length === 0) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    // Validation
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (name.length > 255) {
      res.status(400).json({ error: 'Name cannot exceed 255 characters' });
      return;
    }
    if (contact && contact.length > 255) {
      res.status(400).json({ error: 'Contact cannot exceed 255 characters' });
      return;
    }

    await pool.query('UPDATE suppliers SET name = ?, contact = ? WHERE id = ?', [
      name,
      contact ?? null,
      id,
    ]);

    res.json({
      message: 'Supplier updated successfully',
      data: { id: Number(id), name, contact: contact ?? null },
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if supplier exists
    const [check] = await pool.query<Supplier[]>('SELECT * FROM suppliers WHERE id = ?', [id]);
    if (check.length === 0) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }

    // Set supplier_id to NULL for related inventory items
    await pool.query('UPDATE inventory SET supplier_id = NULL WHERE supplier_id = ?', [id]);
    await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
};