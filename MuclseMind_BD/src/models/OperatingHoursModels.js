// MuclseMind_BD/src/models/OperatingHoursModels.js
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const getOperatingHours = async (userId) => {
  const { data, error } = await supabase
    .from('operating_hours')
    .select('day, status, open_time, close_time')
    .eq('user_id', userId);

  if (error) {
    console.error("Error fetching operating hours:", error);
    throw error;
  }
  return data;
};

const updateOperatingHours = async (id, hoursData) => {
  const { data, error } = await supabase
    .from('operating_hours')
    .update(hoursData)
    .eq('id', id);

  if (error) {
    console.error("Error updating operating hours:", error);
    throw error;
  }
  return data;
};

const upsertOperatingHours = async (userId, hoursData) => {
  const { data, error } = await supabase
    .from('operating_hours')
    .upsert(hoursData, { onConflict: ['user_id', 'day'] });

  if (error) {
    console.error("Error upserting operating hours:", error);
    throw error;
  }
  return data;
};

const getOperatingHoursByDay = async (day) => {
  const { data, error } = await supabase
    .from('operating_hours')
    .select('*')
    .eq('day', day);

  if (error) throw error;
  return data;
};

module.exports = { getOperatingHours, updateOperatingHours, upsertOperatingHours, getOperatingHoursByDay };