const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// Note: '/' and '/all' are distinct exact paths (no dynamic ':id' segment
// in this router), so declaration order between them doesn't matter here —
// unlike routers that mix static and ':id' paths (see routes/companies.js),
// where a dynamic segment could otherwise shadow a static one.
router.post('/', applicationController.applyToCompany);
router.get('/', applicationController.getApplicationsByEmail);
router.get('/all', applicationController.getAllApplications);

module.exports = router;
