const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const {
  getAllPrescriptions,
  dispensePrescription,
  createPrescription,
  getStock,
  upsertStock,
} = require('../controllers/pharmacy.controller');

router.use(protect);

router.get('/prescriptions', getAllPrescriptions);
router.post('/prescriptions', createPrescription);
router.put('/prescriptions/:id/dispense', dispensePrescription);

router.get('/stock', getStock);
router.post('/stock', upsertStock);

module.exports = router;