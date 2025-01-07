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
  try {
    // Generate a unique 5-digit appointment ID
    let isUnique = false;
    let appointmentId;

    while (!isUnique) {
      // Generate a random 5-digit number
      appointmentId = Math.floor(10000 + Math.random() * 90000).toString();

      // Check if the generated ID is unique
      const { data: existingAppointment, error: checkError } = await supabase
        .from('appointments')
        .select('appointment_id')
        .eq('appointment_id', appointmentId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (!existingAppointment) {
        isUnique = true;
      }
    }

    // Add the appointment_id to the data
    const appointmentWithId = {
      ...appointmentData,
      appointment_id: appointmentId
    };

    // Insert the appointment with the generated ID
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentWithId])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in createAppointment:', error);
    throw error;
  }
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
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    success: true,
    data: data,
    message: 'Appointment updated successfully'
  };
};

const deleteAppointment = async (id) => {
  const { data, error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return data;
};

const getTodayAppointments = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('time', { ascending: true });

  if (error) throw error;
  return data;
};

const getAppointmentsByDateRange = async (userId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw error;
  return data;
};

module.exports = { createAppointment, getAppointments, getAppointmentsByDate, updateAppointment, deleteAppointment, getTodayAppointments, getAppointmentsByDateRange }; 