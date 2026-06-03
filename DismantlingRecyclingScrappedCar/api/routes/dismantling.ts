import { Router } from 'express';
import { dismantlingController } from '../controllers/DismantlingController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', dismantlingController.getTasks);
router.get('/:id', dismantlingController.getTask);
router.post('/', requireRole('admin', 'operator'), dismantlingController.createTask);
router.put('/:id/start', requireRole('admin', 'operator'), dismantlingController.startTask);
router.put('/:id/complete', requireRole('admin', 'operator'), dismantlingController.completeTask);
router.post('/:id/parts', requireRole('admin', 'operator'), dismantlingController.addPart);
router.put('/parts/:id', requireRole('admin', 'operator'), dismantlingController.updatePart);

export default router;
