const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const { getAllCases, reportCase } = require('../controllers/surveillance.controller');

router.use(protect);

router.get('/cases', getAllCases);
router.post('/cases', reportCase);

module.exports = router;