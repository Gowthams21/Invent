import { Router } from 'express';
import {
  getAllInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  filterInventory,
} from '../controllers/inventory.controller';

const router = Router();

router.get('/', (req, res) => {
  console.log('GET /api/inventory called');
  getAllInventory(req, res);
});
router.get('/:id', getInventoryById);
router.post('/', createInventory);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);
router.get('/filter', filterInventory);

export default router;