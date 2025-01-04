const { addTreatment, getTreatments, editTreatment, deleteTreatment } = require('../services/TreatmentService');
const { createResponse } = require('../utils/responseUtil');

const addTreatmentController = async (req, res) => {
  const { id: userId } = req.user;
  const treatmentData = { ...req.body, user_id: userId };
  try {
    const newTreatment = await addTreatment(treatmentData);
    res.status(201).json(createResponse(true, 'Treatment added successfully', newTreatment));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to add treatment', null, error.message));
  }
};

const getTreatmentsController = async (req, res) => {
  const { id: userId } = req.user;
  try {
    const treatments = await getTreatments(userId);
    res.status(200).json(createResponse(true, 'Treatments retrieved successfully', treatments));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to retrieve treatments', null, error.message));
  }
};

const editTreatmentController = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  try {
    const updatedTreatment = await editTreatment(id, req.body);
    console.log(updatedTreatment);
    res.status(200).json(createResponse(true, 'Treatment updated successfully', updatedTreatment));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to update treatment', null, error.message));
  }
};

const deleteTreatmentController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteTreatment(id);
    res.status(200).json(createResponse(true, 'Treatment deleted successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Failed to delete treatment', null, error.message));
  }
};

module.exports = { addTreatmentController, getTreatmentsController, editTreatmentController, deleteTreatmentController };
