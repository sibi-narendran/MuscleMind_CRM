const createPrescription = async (req, res) => {
  const { patient_id, doctor_id, medication_id, dosage, frequency, start_date, end_date, notes, appointment_id, treatment_name, prescription_details } = req.body;
  const user_id = req.user.userId; // Assuming user ID is available from the authenticated session

  if (!user_id) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  const { data, error } = await supabase
    .from('prescriptions')
    .insert([{
      patient_id,
      doctor_id,
      medication_id,
      dosage,
      frequency,
      start_date,
      end_date,
      notes,
      appointment_id,
      treatment_name,
      prescription_details,
      user_id // Ensure user_id is included
    }]);

  if (error) {
    return res.status(500).json({ success: false, message: 'Failed to create prescription', error });
  }

  return res.status(201).json({ success: true, data });
}; 