import { Router } from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/suppliers.controller';

const router = Router();

router.get('/', (req, res) => {
  console.log('GET /api/suppliers called'); // Debug log
  getAllSuppliers(req, res);
});
router.get('/:id', getSupplierById);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

export default router;