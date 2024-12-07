const billingService = require('../services/BillingServices');
const { createResponse } = require('../utils/responseUtil');

const getBillings = async (req, res) => {
  const userId = req.user.userId;
  const result = await billingService.fetchBillings(userId);
  if (result.error) {
    res.status(500).json(createResponse(false, 'Failed to fetch billings', null, result.error));
  } else {
    res.status(200).json(createResponse(true, 'Billings fetched successfully', result.data));
  }
};

const createBilling = async (req, res) => {
  const billingData = req.body;
  const result = await billingService.addBilling(billingData);
  if (result.error) {
    res.status(500).json(createResponse(false, 'Failed to create billing', null, result.error));
  } else {
    res.status(201).json(createResponse(true, 'Billing created successfully', result.data));
  }
};

const updateBilling = async (req, res) => {
  const { id: billingId } = req.params;
  const billingData = req.body;
  const userId = req.user.userId;
  console.log(billingData);
  console.log(billingId);
  console.log(userId);
  const result = await billingService.editBilling(billingId, billingData, userId);
  if (result.error) {
    res.status(500).json(createResponse(false, 'Failed to update billing', null, result.error));
  } else {
    res.status(200).json(createResponse(true, 'Billing updated successfully', result.data));
  }
};

const deleteBilling = async (req, res) => {
  const { id: billingId } = req.params;
  const userId = req.user.userId;
  const result = await billingService.removeBilling(billingId, userId);
  if (result.error) {
    res.status(500).json(createResponse(false, 'Failed to delete billing', null, result.error));
  } else {
    res.status(200).json(createResponse(true, 'Billing deleted successfully', result.data));
  }
};

module.exports = { getBillings, createBilling, updateBilling, deleteBilling }; 