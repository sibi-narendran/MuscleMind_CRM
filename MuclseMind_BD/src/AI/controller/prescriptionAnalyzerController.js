const prescriptionAnalyzerService = require('../services/prescriptionAnalyzerService');
const { createResponse } = require('../utils/responseUtil');

const generatePrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.userId;

    const prescription = await prescriptionAnalyzerService.generatePrescription(appointmentId, userId);
    
    if (!prescription) {
      return res.status(404).json(
        createResponse(false, 'Failed to generate prescription', null)
      );
    }

    res.status(200).json(
      createResponse(true, 'Prescription generated successfully', prescription)
    );

  } catch (error) {
    console.error('Error in generatePrescription:', error);
    res.status(500).json(
      createResponse(false, 'Error generating prescription', null, error.message)
    );
  }
};

module.exports = {
  generatePrescription
};
