const prescriptionAnalyzerModel = require('../models/prescriptionAnalyzerModel');

const generatePrescription = async (appointmentId, userId) => {
  try {
    // Get appointment details
    const appointment = await prescriptionAnalyzerModel.getAppointmentDetails(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment not found: ${appointmentId}`);
    }

    // Get all medications
    const allMedications = await prescriptionAnalyzerModel.getAllMedications();
    if (!allMedications?.length) {
      throw new Error('No medications found in database');
    }

    // Generate new prescription number
    const newRxNumber = `RX${String(allMedications.length + 1).padStart(4, '0')}`;

    // Get AI suggestions
    const suggestedMedicines = await prescriptionAnalyzerModel.analyzeMedicationsWithAI(
      appointment.treatment_name,
      {
        patient_name: appointment.patient_name,
        age: appointment.age,
        gender: appointment.gender
      },
      allMedications
    );

    if (!suggestedMedicines?.length) {
      throw new Error('No medications were suggested');
    }

    // Create prescription
    const prescriptionData = {
      prescription_no: newRxNumber,
      patient_name: appointment.patient_name,
      age: appointment.age,
      gender: appointment.gender,
      date: new Date().toISOString().split('T')[0],
      medicines: suggestedMedicines,
      user_id: userId,
      treatment_name: appointment.treatment_name,
      appointment_id: appointmentId
    };

    return await prescriptionAnalyzerModel.createPrescription(prescriptionData);

  } catch (error) {
    console.error('Error in generatePrescription service:', error);
    throw error;
  }
};

module.exports = {
  generatePrescription
};
