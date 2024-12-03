const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.createHoliday = async ({ name, date, user_id }) => {
  console.log('Inserting holiday with user ID:', user_id);
  const { data, error } = await supabase
    .from('holidays')
    .insert([{ name, date, user_id }]);
  if (error) {
    console.error('Error inserting holiday:', error);
    throw error;
  }
  return data;
};

exports.findAllHolidays = async () => {
  const { data: rows, error } = await supabase
    .from('holidays')
    .select('*');
  if (error) throw error;
  return rows;
};

exports.updateHoliday = async (id, data) => {
  const { name, date } = data;
  const { data: result, error } = await supabase
    .from('holidays')
    .update({ name, date })
    .match({ id });
  if (error) throw error;
  return result;
};

exports.deleteHoliday = async (id) => {
  const { data: result, error } = await supabase
    .from('holidays')
    .delete()
    .match({ id });
  if (error) throw error;
  return result;
}; 