const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const getPrescriptions = async (userId) => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', userId);
  
    return { data, error };
  };
  
  const createPrescription = async (prescriptionData) => {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([prescriptionData]);
  
    return { data, error };
  };
  
  const updatePrescription = async (prescriptionId, prescriptionData, userId) => {
    const { data, error } = await supabase
      .from('prescriptions')
      .update(prescriptionData)
      .match({ id: prescriptionId, user_id: userId });
  
    return { data, error };
  };
  
  const deletePrescription = async (prescriptionId, userId) => {
    const { data, error } = await supabase
      .from('prescriptions')
      .delete()
      .match({ id: prescriptionId, user_id: userId });
  
    return { data, error };
  };
  
  module.exports = { getPrescriptions, createPrescription, updatePrescription, deletePrescription };