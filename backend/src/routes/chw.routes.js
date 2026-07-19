const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const { logVisit, getAllVisits } = require('../controllers/chw.controller');

router.use(protect);

router.post('/visits', logVisit);
router.get('/visits', getAllVisits);

module.exports = router;