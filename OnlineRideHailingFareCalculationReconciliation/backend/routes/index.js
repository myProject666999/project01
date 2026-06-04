const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const driverController = require('../controllers/driverController');
const tripController = require('../controllers/tripController');
const platformOrderController = require('../controllers/platformOrderController');
const reconciliationController = require('../controllers/reconciliationController');
const appealController = require('../controllers/appealController');
const pricingRuleController = require('../controllers/pricingRuleController');
const gpsController = require('../controllers/gpsController');

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

router.get('/drivers', driverController.getDrivers);
router.get('/drivers/:id', driverController.getDriver);
router.post('/drivers', driverController.createDriver);
router.put('/drivers/:id', driverController.updateDriver);
router.delete('/drivers/:id', driverController.deleteDriver);

router.get('/trips', tripController.getTrips);
router.get('/trips/:id', tripController.getTrip);
router.post('/trips', tripController.createTrip);
router.put('/trips/:id/complete', tripController.completeTrip);
router.get('/trips/summary/:driverId/:date', tripController.getDriverDailySummary);

router.post('/platform-orders/import', upload.single('file'), platformOrderController.importOrders);
router.post('/platform-orders/api', platformOrderController.createOrderApi);
router.get('/platform-orders', platformOrderController.getOrders);
router.get('/platform-orders/:id', platformOrderController.getOrder);
router.put('/platform-orders/:id/match', platformOrderController.matchOrder);
router.post('/platform-orders/auto-match', platformOrderController.autoMatch);

router.post('/reconciliations', reconciliationController.createReconciliation);
router.get('/reconciliations', reconciliationController.getReconciliations);
router.get('/reconciliations/detail', reconciliationController.getReconciliation);
router.get('/reconciliations/:id/details', reconciliationController.getReconciliationDetails);
router.put('/reconciliations/:id/confirm', reconciliationController.confirmReconciliation);
router.get('/reconciliations/daily-report/:driverId/:date', reconciliationController.getDriverDailyReport);

router.post('/appeals', appealController.createAppeal);
router.get('/appeals', appealController.getAllAppeals);
router.get('/appeals/:id', appealController.getAppeal);
router.get('/appeals/driver/:driverId', appealController.getDriverAppeals);
router.put('/appeals/:id/handle', appealController.handleAppeal);
router.get('/appeals/pending/count', appealController.getPendingCount);

router.get('/pricing-rules/active', pricingRuleController.getActiveRule);
router.get('/pricing-rules', pricingRuleController.getAllRules);
router.post('/pricing-rules', pricingRuleController.createRule);
router.put('/pricing-rules/:id', pricingRuleController.updateRule);
router.put('/pricing-rules/:id/active', pricingRuleController.setActiveRule);
router.post('/pricing-rules/calculate', pricingRuleController.calculateTestFare);

router.post('/gps/upload', gpsController.uploadGpsData);
router.post('/gps/upload-batch', gpsController.uploadGpsBatch);
router.get('/gps', gpsController.getGpsData);
router.get('/gps/trip/:tripId', gpsController.getGpsDataByTrip);

module.exports = router;
