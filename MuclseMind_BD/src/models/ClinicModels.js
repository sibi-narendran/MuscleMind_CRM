const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get clinic information
const   getClinicInfo = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Failed to get clinic info:', error);
    throw error; // Rethrow to handle it further up the call stack
  }
};

// Function to update clinic information
const updateClinicInfo = async (clinicId, clinicData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(clinicData)
      .eq('id', clinicId);

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Failed to update clinic info:', error);
    throw error; // Rethrow to handle it further up the call stack
  }
};
const updateClinicImages = async (userId, imageData) => {
  try {
    const { data, error } = await supabase
      .from('clinic_settings')
      .upsert([{
        user_id: userId,
        header_image: imageData.header_image_url,
        footer_image: imageData.footer_image_url,
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateClinicImages:', error);
    return { data: null, error: error.message };
  }
};

module.exports = {
  getClinicInfo,
  updateClinicInfo,
  updateClinicImages
};