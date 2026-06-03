import { Router } from 'express';
import { inventoryController } from '../controllers/InventoryController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', inventoryController.getItems);
router.get('/:id', inventoryController.getItem);
router.post('/inbound', requireRole('admin', 'operator'), inventoryController.stockIn);
router.put('/:id/outbound', requireRole('admin', 'operator'), inventoryController.stockOut);

export default router;
