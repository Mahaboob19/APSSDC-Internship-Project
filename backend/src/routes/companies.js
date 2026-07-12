const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Student-facing
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);

// Admin-facing
router.post('/', companyController.createCompany);
router.put('/:id', companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);

module.exports = router;
