import { Router } from 'express';
import { hazardousController } from '../controllers/HazardousController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/wastes', hazardousController.getWastes);
router.get('/wastes/pending', hazardousController.getPendingWastes);
router.get('/wastes/:id', hazardousController.getWaste);
router.post('/wastes', requireRole('admin', 'hazardous_admin'), hazardousController.createWaste);

router.get('/waybills', hazardousController.getWaybills);
router.get('/waybills/:id', hazardousController.getWaybill);
router.post('/waybills', requireRole('admin', 'hazardous_admin'), hazardousController.createWaybill);
router.put('/waybills/:id/signback', requireRole('admin', 'hazardous_admin'), hazardousController.signBackWaybill);

export default router;
