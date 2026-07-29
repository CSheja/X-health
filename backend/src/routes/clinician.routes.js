const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const {
  getMyAppointments,
  getMyPatients,
  createVisit,
  createReferral,
  getFacilities,
} = require('../controllers/clinician.controller');

router.use(protect);

router.get('/appointments', getMyAppointments);
router.get('/patients', getMyPatients);
router.get('/facilities', getFacilities);
router.post('/visits', createVisit);
router.post('/referrals', createReferral);

module.exports = router;