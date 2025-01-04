const billingModel = require('../models/billingModel');

const fetchBillings = async (userId) => {
  try {
    const result = await billingModel.getBillingsByUserId(userId);
    if (result.error) throw new Error(result.error);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error in fetchBillings service:', error);
    return { success: false, error: error.message };
  }
};

const addBilling = async (billingData) => {
  try {
    const result = await billingModel.createBilling(billingData);
    if (result.error) throw new Error(result.error);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error in addBilling service:', error);
    return { success: false, error: error.message };
  }
};

const editBilling = async (id, billingData, userId) => {
  try {
    const result = await billingModel.updateBilling(id, billingData, userId);
    if (result.error) throw new Error(result.error);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error in editBilling service:', error);
    return { success: false, error: error.message };
  }
};

const removeBilling = async (id, userId) => {
  try {
    const result = await billingModel.deleteBilling(id, userId);
    if (result.error) throw new Error(result.error);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error in removeBilling service:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { 
  fetchBillings, 
  addBilling, 
  editBilling, 
  removeBilling 
}; 