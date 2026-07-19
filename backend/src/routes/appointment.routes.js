const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  getAppointment,
} = require('../controllers/appointment.controller');

router.use(protect);

router.post('/', createAppointment);
router.get('/', getAllAppointments);
router.get('/:id', getAppointment);
router.put('/:id/status', updateAppointmentStatus);

module.exports = router;