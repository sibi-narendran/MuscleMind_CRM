const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const createAppointment = async (appointmentData) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData]);

  if (error) throw error;
  return data;
};

const getAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*');

  if (error) throw error;
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