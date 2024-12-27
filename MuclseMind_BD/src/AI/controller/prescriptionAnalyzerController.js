const prescriptionAnalyzerService = require('../services/prescriptionAnalyzerService');
const { createResponse } = require('../../utils/responseUtil');

const generatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const prescriptionData = req.body;

    const updatedPrescription = await prescriptionAnalyzerService.generatePrescription(
      id, 
      userId,
      prescriptionData
    );
    
    if (!updatedPrescription) {
      return res.status(404).json(
        createResponse(false, 'Failed to update prescription medicines', null)
      );
    }

    res.status(200).json(
      createResponse(true, 'Prescription medicines updated successfully', updatedPrescription)
    );

  } catch (error) {
    console.error('Error in generatePrescription:', error);
    res.status(500).json(
      createResponse(false, 'No medications were suggested', null, error.message)
    );
  }
};

module.exports = {
  generatePrescription
};
