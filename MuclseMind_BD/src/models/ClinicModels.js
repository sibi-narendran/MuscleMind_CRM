const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const createClinic = async (clinicData) => {
  const { data, error } = await supabase
    .from('clinics')
    .insert([clinicData]);

  if (error) {
    console.error("Error creating clinic:", error);
    throw error;
  }
  return data;
};

const getClinics = async (userId) => {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("Error fetching clinics:", error);
    throw error;
  }
  return data;
};

const updateClinic = async (id, clinicData) => {
  const { data, error } = await supabase
    .from('clinics')
    .update(clinicData)
    .eq('id', id);

  if (error) {
    console.error("Error updating clinic:", error);
    throw error;
  }
  return data;
};

const deleteClinic = async (id) => {
  const { data, error } = await supabase
    .from('clinics')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting clinic:", error);
    throw error;
  }
  return data;
};

module.exports = { createClinic, getClinics, updateClinic, deleteClinic };
