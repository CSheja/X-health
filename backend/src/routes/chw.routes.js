const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const { logVisit, getAllVisits, reportCase, getMyCases } = require('../controllers/chw.controller');

router.use(protect);

router.post('/visits', logVisit);
router.get('/visits', getAllVisits);
router.post('/cases', reportCase);
router.get('/cases', getMyCases);

module.exports = router;