const prescriptionAnalyzerModel = require('../models/prescriptionAnalyzerModel');

const generatePrescription = async (id, userId, prescriptionData) => {
  try {
    // Get user-specific medications
    const allMedications = await prescriptionAnalyzerModel.getAllMedications(userId);
    if (!allMedications?.length) {
      throw new Error('No medications found for this user');
    }

    // Get AI suggestions using provided data and user-specific medications
    const suggestedMedicines = await prescriptionAnalyzerModel.analyzeMedicationsWithAI(
      prescriptionData.treatment_name,
      {
        patient_name: prescriptionData.patient_name,
        age: prescriptionData.age,
        gender: prescriptionData.gender
      },
      allMedications,
      userId
    );

    if (!suggestedMedicines?.length) {
      throw new Error('No medications were suggested');
    }

    // Update prescription with new medicines
    return await prescriptionAnalyzerModel.updatePrescriptionMedicines(id, suggestedMedicines);

  } catch (error) {
    console.error('Error in generatePrescription service:', error);
    throw error;
  }
};

module.exports = {
  generatePrescription
};
