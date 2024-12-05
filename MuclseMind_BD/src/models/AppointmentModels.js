const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to generate a unique 5-digit appointment ID
const generateAppointmentId = async () => {
  let isUnique = false;
  let appointmentId;

  while (!isUnique) {
    // Generate a random 5-digit number
    appointmentId = Math.floor(10000 + Math.random() * 90000).toString();

    // Check if the generated ID is unique
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_id')
      .eq('appointment_id', appointmentId);

    if (error) throw error;

    if (data.length === 0) {
      isUnique = true;
    }
  }

  return appointmentId;
};

const createAppointment = async (appointmentData) => {
  // Generate a unique 5-digit appointment ID
  const appointmentId = await generateAppointmentId();

  const { data, error } = await supabase
    .from('appointments')
    .insert([{ ...appointmentData, appointment_id: appointmentId }]);
  
  console.log(appointmentData);

  if (error) throw error;
  return data;
};

const getAppointments = async (userId) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId);  // Filter appointments by user_id

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getAppointmentsByDate = async (date) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', date);

  if (error) throw error;
  return data;
};

const updateAppointment = async (id, updatedData) => {
  const { data, error } = await supabase
    .from('appointments')
    .update(updatedData)
    .eq('id', id);

  if (error) throw error;
  return data;
};

const deleteAppointment = async (id) => {
  const { data, error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return data;
};

module.exports = { createAppointment, getAppointments, getAppointmentsByDate, updateAppointment, deleteAppointment }; 