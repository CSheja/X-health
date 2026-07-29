const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const { getAllCases, reportCase, getSurveillanceStats } = require('../controllers/surveillance.controller');
router.use(protect);
router.get('/cases', getAllCases);
router.post('/cases', reportCase);
router.get('/stats', getSurveillanceStats);
module.exports = router;