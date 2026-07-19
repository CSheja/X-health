const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const { getSessions, startSession, endSession } = require('../controllers/telemedicine.controller');

router.use(protect);

router.get('/sessions', getSessions);
router.post('/sessions/start', startSession);
router.post('/sessions/end', endSession);

module.exports = router;