const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const createPatient = async (patientData) => {
  // First verify the user exists
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', patientData.user_id)
    .single();

  // if (userError || !user) {
  //   throw new Error('Invalid user ID or user does not exist');
  // }

  // Then create the patient
  const { data, error } = await supabase
    .from('patients')
    .insert([{
      ...patientData,
      created_at: new Date()
    }])
    .select();

  if (error) {
    console.error("Error creating patient:", error);
    throw error;
  }
  return data;
};

const getPatientsByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
  return data;
};

const updatePatient = async (id, patientData) => {
  const { data, error } = await supabase
    .from('patients')
    .update(patientData)
    .eq('id', id)
    .select();

  if (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
  return data;
};

const deletePatient = async (id) => {
  const { data, error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error("Error deleting patient:", error);
    throw error;
  }
  return data;
};

module.exports = {
  createPatient,
  getPatientsByUserId,
  updatePatient,
  deletePatient
}; 