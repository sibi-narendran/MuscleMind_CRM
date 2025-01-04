const billingService = require('../services/BillingServices');
const { createResponse } = require('../utils/responseUtil');

const getBillings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await billingService.fetchBillings(userId);
    
    if (!result.success) {
      return res.status(500).json(
        createResponse(false, 'Failed to fetch billings', null, result.error)
      );
    }

    res.status(200).json(
      createResponse(true, 'Billings fetched successfully', result.data)
    );
  } catch (error) {
    console.error('Error in getBillings controller:', error);
    res.status(500).json(
      createResponse(false, 'Failed to fetch billings', null, error.message)
    );
  }
};

const createBilling = async (req, res) => {
  try {
    const billingData = {
      ...req.body,
      user_id: req.user.userId,
      created_at: new Date().toISOString()
    };
    
    const result = await billingService.addBilling(billingData);
    
    if (!result.success) {
      return res.status(500).json(
        createResponse(false, 'Failed to create billing', null, result.error)
      );
    }

    res.status(201).json(
      createResponse(true, 'Billing created successfully', result.data)
    );
  } catch (error) {
    console.error('Error in createBilling controller:', error);
    res.status(500).json(
      createResponse(false, 'Failed to create billing', null, error.message)
    );
  }
};

const updateBilling = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const billingData = req.body;

    const result = await billingService.editBilling(id, billingData, userId);
    
    if (!result.success) {
      return res.status(500).json(
        createResponse(false, 'Failed to update billing', null, result.error)
      );
    }

    res.status(200).json(
      createResponse(true, 'Billing updated successfully', result.data)
    );
  } catch (error) {
    console.error('Error in updateBilling controller:', error);
    res.status(500).json(
      createResponse(false, 'Failed to update billing', null, error.message)
    );
  }
};

const deleteBilling = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await billingService.removeBilling(id, userId);
    
    if (!result.success) {
      return res.status(500).json(
        createResponse(false, 'Failed to delete billing', null, result.error)
      );
    }

    res.status(200).json(
      createResponse(true, 'Billing deleted successfully', result.data)
    );
  } catch (error) {
    console.error('Error in deleteBilling controller:', error);
    res.status(500).json(
      createResponse(false, 'Failed to delete billing', null, error.message)
    );
  }
};

module.exports = {
  getBillings,
  createBilling,
  updateBilling,
  deleteBilling
}; 