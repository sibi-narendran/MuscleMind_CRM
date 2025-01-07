// MuclseMind_BD/src/models/OperatingHoursModels.js
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const getOperatingHours = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('operating_hours')
      .select('day, status, shift_1_open_time, shift_1_close_time, shift_2_open_time, shift_2_close_time')
      .eq('user_id', userId)
      .order('day');

    if (error) throw error;

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return daysOfWeek.map(day => {
      const existingDay = data.find(d => d.day === day) || {};
      return {
        day,
        status: existingDay.status || 'closed',
        shift_1_open_time: existingDay.shift_1_open_time || null,
        shift_1_close_time: existingDay.shift_1_close_time || null,
        shift_2_open_time: existingDay.shift_2_open_time || null,
        shift_2_close_time: existingDay.shift_2_close_time || null
      };
    });
  } catch (error) {
    console.error('Error in getOperatingHours:', error);
    throw error;
  }
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
  try {
    // First delete existing records for this user
    const { error: deleteError } = await supabase
      .from('operating_hours')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Then insert new records
    const formattedData = hoursData.map(hour => ({
      user_id: userId,
      day: hour.day.toLowerCase(),
      status: hour.status,
      shift_1_open_time: hour.shift_1_open_time,
      shift_1_close_time: hour.shift_1_close_time,
      shift_2_open_time: hour.shift_2_open_time,
      shift_2_close_time: hour.shift_2_close_time
    }));

    const { data, error: insertError } = await supabase
      .from('operating_hours')
      .insert(formattedData)
      .select();

    if (insertError) {
      console.error('Error inserting operating hours:', insertError);
      throw insertError;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertOperatingHours:', error);
    throw error;
  }
};

const getOperatingHoursByDay = async (day, userId) => {
  try {
    const { data, error } = await supabase
      .from('operating_hours')
      .select('*')
      .eq('day', day)
      .eq('user_id', userId);

    if (error) throw error;

    // Return the first matching record or null if none found
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getOperatingHoursByDay:', error);
    throw error;
  }
};

module.exports = { getOperatingHours, updateOperatingHours, upsertOperatingHours, getOperatingHoursByDay };