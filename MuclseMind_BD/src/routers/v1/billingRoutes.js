const express = require('express');
const controller = require('../../controller/billingController');
const { authenticateJWTUserID } = require('../../middleware/authMiddleware');
const billingRouter = express.Router();

billingRouter.get('/get-billing', authenticateJWTUserID, controller.getBillings);
billingRouter.post('/add-billing', authenticateJWTUserID, controller.createBilling);
billingRouter.put('/update-billing/:id', authenticateJWTUserID, controller.updateBilling);
billingRouter.delete('/delete-billing/:id', authenticateJWTUserID, controller.deleteBilling);

module.exports = billingRouter; 