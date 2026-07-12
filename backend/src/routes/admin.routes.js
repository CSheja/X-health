const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const { getAllUsers, updateUserStatus, deleteUser } = require('../controllers/admin.controller');

router.use(protect);

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;