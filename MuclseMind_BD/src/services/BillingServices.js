const billingModel = require('../models/billingModel');

const fetchBillings = async (userId) => {
  return await billingModel.getBillings(userId);
};

const addBilling = async (billingData) => {
  return await billingModel.createBilling(billingData);
};

const editBilling = async (id, billingData, userId) => {
  return await billingModel.updateBilling(id, billingData, userId);
};

const removeBilling = async (id, userId) => {
  return await billingModel.deleteBilling(id, userId);
};

module.exports = { fetchBillings, addBilling, editBilling, removeBilling }; 