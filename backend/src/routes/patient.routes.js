const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const {
  registerPatient,
  getAllPatients,
  getPatient,
  updatePatient,
} = require('../controllers/patient.controller');

router.use(protect);

router.post('/', registerPatient);
router.get('/', getAllPatients);
router.get('/:id', getPatient);
router.put('/:id', updatePatient);

module.exports = router;