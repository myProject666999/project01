import { Router } from 'express';
import { vehicleController } from '../controllers/VehicleController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', vehicleController.getVehicles);
router.get('/search', vehicleController.searchVehicles);
router.get('/:id', vehicleController.getVehicle);
router.post('/', requireRole('admin', 'operator'), vehicleController.createVehicle);
router.put('/:id', requireRole('admin', 'operator'), vehicleController.updateVehicle);
router.delete('/:id', requireRole('admin'), vehicleController.deleteVehicle);

export default router;
