import { Router } from 'express';
import { reportController } from '../controllers/ReportController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/monthly', reportController.getReports);
router.get('/monthly/:id', reportController.getReport);
router.post('/monthly/generate', requireRole('admin'), reportController.generateReport);
router.get('/monthly/:id/export', reportController.exportReport);

export default router;
