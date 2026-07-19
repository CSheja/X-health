const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getClinicianByUserId,
} = require('../controllers/admin.controller');

router.use(protect);

router.get('/users', getAllUsers);
router.get('/users/:id/clinician', getClinicianByUserId);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;