const express = require('express');
const { generateInvoiceDescriptionController } = require('../invoiceController');
const { authenticateJWTUserID } = require('../../middleware/authMiddleware');

const router = express.Router();

router.put('/generate-invoice/:id', authenticateJWTUserID, generateInvoiceDescriptionController);

module.exports = router;