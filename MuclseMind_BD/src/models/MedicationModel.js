const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const createMedication = async (medicationData) => {
  const { data, error } = await supabase
    .from('medications')
    .insert([medicationData]);

  if (error) {
    console.error("Error creating medication:", error);
    throw error;
  }
  return data;
};

const getMedicationsByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("Error fetching medications:", error);
    throw error;
  }

  return data;
};

const updateMedication = async (id, medicationData) => {
  const { data, error } = await supabase
    .from('medications')
    .update(medicationData)
    .eq('id', id);

  if (error) {
    console.error("Error updating medication:", error);
    throw error;
  }

  return data;
};

const deleteMedication = async (id) => {
  const { data, error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting medication:", error);
    throw error;
  }

  return data;
};

module.exports = { createMedication, getMedicationsByUserId, updateMedication, deleteMedication };
